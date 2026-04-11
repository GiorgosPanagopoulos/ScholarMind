"""Agent tools: web_search, store_finding, retrieve_context."""

from __future__ import annotations

from typing import TYPE_CHECKING

from duckduckgo_search import DDGS

if TYPE_CHECKING:
    from rag import RAGPipeline


async def web_search(query: str) -> str:
    """Search the web via DuckDuckGo and return top-5 results as a formatted string."""
    try:
        results: list[dict] = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=5):
                results.append(r)

        if not results:
            return f"No results found for query: {query}"

        lines: list[str] = []
        for i, r in enumerate(results, 1):
            title = r.get("title", "No title")
            body = r.get("body", "No snippet")
            href = r.get("href", "")
            lines.append(f"[{i}] {title}\n    {body}\n    URL: {href}")

        return "\n\n".join(lines)

    except Exception as exc:  # noqa: BLE001
        return f"Search error for '{query}': {exc}"


async def store_finding(
    rag: "RAGPipeline",
    sub_question: str,
    facts: list[str],
    sources: list[dict],
    confidence: float,
) -> None:
    """Store a synthesized finding in ChromaDB."""
    rag.add_finding(
        sub_question=sub_question,
        facts=facts,
        sources=sources,
        confidence=confidence,
    )


async def retrieve_context(
    rag: "RAGPipeline",
    query: str,
    top_k: int = 3,
) -> str:
    """Retrieve relevant findings from ChromaDB and return as a formatted string."""
    findings = rag.retrieve(query, top_k=top_k)

    if not findings:
        return "No relevant context found in the research database."

    lines: list[str] = []
    for i, f in enumerate(findings, 1):
        sub_q = f.get("sub_question", "")
        text = f.get("text", "")
        confidence = f.get("confidence", 0.0)
        sources: list[dict] = f.get("sources", [])

        source_str = ""
        if sources:
            urls = [s.get("url", "") for s in sources if s.get("url")]
            if urls:
                source_str = "\n    Sources: " + ", ".join(urls[:3])

        lines.append(
            f"[{i}] Sub-question: {sub_q}\n"
            f"    Confidence: {confidence:.2f}\n"
            f"    {text[:400]}{'...' if len(text) > 400 else ''}"
            f"{source_str}"
        )

    return "\n\n".join(lines)
