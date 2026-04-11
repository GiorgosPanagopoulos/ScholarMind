"""Multi-step research agent using the Anthropic Claude API directly."""

from __future__ import annotations

import json
import re
from typing import AsyncGenerator

import anthropic

from prompts import (
    FOLLOWUP_PROMPT,
    PLANNER_PROMPT,
    QUERY_REWRITER_PROMPT,
    REPORT_WRITER_PROMPT,
    SEARCH_SYNTHESIZER_PROMPT,
)
from rag import RAGPipeline
from tools import retrieve_context, store_finding, web_search

MODEL = "claude-sonnet-4-5"
MAX_TOKENS = 4096


def _call_claude(client: anthropic.Anthropic, prompt: str) -> str:
    """Synchronous Claude API call; returns the text content."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def _parse_json_response(text: str) -> dict:
    """Attempt to parse JSON from a Claude response, stripping markdown fences."""
    # Strip markdown code blocks if present
    cleaned = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("```").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object inside the text
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


class ResearchAgent:
    def __init__(self) -> None:
        self.client = anthropic.Anthropic()
        self.rag = RAGPipeline()

    # ------------------------------------------------------------------
    # Main research pipeline
    # ------------------------------------------------------------------

    async def research(self, topic: str) -> AsyncGenerator[dict, None]:
        """Streaming generator that yields step dicts through the research pipeline."""

        # ── 1. PLAN ────────────────────────────────────────────────────
        yield {
            "step": "planning",
            "sub_step": 0,
            "total_steps": 0,
            "message": "Breaking topic into sub-questions...",
            "data": None,
        }

        planner_prompt = PLANNER_PROMPT.format(topic=topic)
        try:
            plan_text = _call_claude(self.client, planner_prompt)
            plan_data = _parse_json_response(plan_text)
            sub_questions: list[str] = plan_data.get("sub_questions", [])
            if not sub_questions:
                raise ValueError("Empty sub_questions list")
        except Exception as exc:
            yield {
                "step": "error",
                "sub_step": 0,
                "total_steps": 0,
                "message": f"Planning failed: {exc}",
                "data": None,
            }
            return

        total_steps = len(sub_questions)

        yield {
            "step": "planning",
            "sub_step": 0,
            "total_steps": total_steps,
            "message": f"Research plan ready: {total_steps} sub-questions identified.",
            "data": sub_questions,
        }

        # ── 2. Clear ChromaDB for fresh session ────────────────────────
        self.rag.clear()

        # ── 3. Per sub-question: rewrite → search → synthesize → store ─
        all_sources: list[dict] = []
        synthesis_results: list[dict] = []

        for i, sub_question in enumerate(sub_questions):
            # 3a. REWRITE query
            rewrite_prompt = QUERY_REWRITER_PROMPT.format(sub_question=sub_question)
            try:
                search_query = _call_claude(self.client, rewrite_prompt).strip()
                # Sanitise: remove quotes, truncate
                search_query = search_query.strip('"\'').strip()
            except Exception:
                search_query = sub_question[:60]

            # 3b. SEARCH
            yield {
                "step": "searching",
                "sub_step": i + 1,
                "total_steps": total_steps,
                "message": f"Searching: {search_query}",
                "data": None,
            }

            search_results = await web_search(search_query)

            # 3c. SYNTHESIZE
            yield {
                "step": "synthesizing",
                "sub_step": i + 1,
                "total_steps": total_steps,
                "message": f"Synthesizing findings for: {sub_question}",
                "data": None,
            }

            synth_prompt = SEARCH_SYNTHESIZER_PROMPT.format(
                sub_question=sub_question,
                search_results=search_results,
            )
            try:
                synth_text = _call_claude(self.client, synth_prompt)
                synth_data = _parse_json_response(synth_text)
                facts: list[str] = synth_data.get("facts", [])
                sources: list[dict] = synth_data.get("sources", [])
                confidence: float = float(synth_data.get("confidence", 0.5))
            except Exception as exc:
                facts = [f"Could not synthesize results: {exc}"]
                sources = []
                confidence = 0.1

            yield {
                "step": "synthesizing",
                "sub_step": i + 1,
                "total_steps": total_steps,
                "message": f"Synthesized findings for: {sub_question}",
                "data": {"facts": facts, "confidence": confidence},
            }

            # 3d. STORE
            await store_finding(self.rag, sub_question, facts, sources, confidence)

            all_sources.extend(sources)
            synthesis_results.append(
                {
                    "sub_question": sub_question,
                    "facts": facts,
                    "sources": sources,
                    "confidence": confidence,
                }
            )

        # ── 4. RETRIEVE all findings ───────────────────────────────────
        all_findings = self.rag.retrieve(topic, top_k=10)

        # ── 5. WRITE report ────────────────────────────────────────────
        yield {
            "step": "writing",
            "sub_step": total_steps,
            "total_steps": total_steps,
            "message": "Generating final report...",
            "data": None,
        }

        # Build context string for the report writer
        findings_text_parts: list[str] = []
        for sr in synthesis_results:
            sq = sr["sub_question"]
            facts_joined = "\n".join(f"  - {f}" for f in sr["facts"])
            findings_text_parts.append(f"### {sq}\n{facts_joined}")

        findings_text = "\n\n".join(findings_text_parts)

        # Build section placeholders for the report
        section_placeholders = "\n".join(
            f"### {sq['sub_question']}" for sq in synthesis_results
        )

        report_prompt = REPORT_WRITER_PROMPT.format(
            topic=topic,
            findings=findings_text,
            section_placeholders=section_placeholders,
        )

        try:
            report_text = _call_claude(self.client, report_prompt)
        except Exception as exc:
            report_text = f"Report generation failed: {exc}"

        # De-duplicate sources by URL
        seen_urls: set[str] = set()
        unique_sources: list[dict] = []
        for s in all_sources:
            url = s.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(s)

        # ── 6. COMPLETE ────────────────────────────────────────────────
        yield {
            "step": "complete",
            "sub_step": total_steps,
            "total_steps": total_steps,
            "message": "Research complete!",
            "data": {
                "report": report_text,
                "sources": unique_sources,
                "sub_questions": sub_questions,
            },
        }

    # ------------------------------------------------------------------
    # Follow-up Q&A
    # ------------------------------------------------------------------

    async def followup(
        self,
        question: str,
        topic: str,
        report_summary: str,
    ) -> AsyncGenerator[dict, None]:
        """Streaming generator for follow-up answers using the stored RAG context."""

        # 1. Retrieve relevant context
        context = await retrieve_context(self.rag, question, top_k=3)

        # 2. Build prompt
        prompt = FOLLOWUP_PROMPT.format(
            topic=topic,
            report_summary=report_summary,
            context=context,
            question=question,
        )

        # 3. Stream Claude response
        try:
            with self.client.messages.stream(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                messages=[{"role": "user", "content": prompt}],
            ) as stream:
                for text_chunk in stream.text_stream:
                    yield {
                        "step": "followup",
                        "message": text_chunk,
                        "done": False,
                    }
        except Exception as exc:
            yield {
                "step": "followup",
                "message": f"\n\n[Error: {exc}]",
                "done": False,
            }

        yield {"step": "followup", "message": "", "done": True}
