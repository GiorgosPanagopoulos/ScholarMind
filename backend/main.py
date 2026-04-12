"""FastAPI application — ScholarMind backend."""

from __future__ import annotations

import json
import os
import sys
from contextlib import asynccontextmanager

# Ensure the backend/ directory is on sys.path so sibling modules resolve
# regardless of whether uvicorn is launched as `backend.main` or `main`.
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

load_dotenv()

# Global agent instance (initialised in lifespan)
_agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _agent
    from agent import ResearchAgent  # noqa: PLC0415  (local import avoids circular at module load)

    _agent = ResearchAgent()
    yield


app = FastAPI(title="ScholarMind API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ResearchRequest(BaseModel):
    topic: str


class FollowupRequest(BaseModel):
    question: str
    topic: str
    report_summary: str


class ExportPdfRequest(BaseModel):
    report_text: str
    topic: str
    sources: list[dict] = []


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": "claude-sonnet-4-5"}


@app.post("/api/research")
async def research(req: ResearchRequest):
    async def event_stream():
        try:
            async for update in _agent.research(req.topic):
                yield f"data: {json.dumps(update)}\n\n"
        except Exception as exc:
            error_event = {"step": "error", "message": str(exc), "data": None}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/followup")
async def followup(req: FollowupRequest):
    async def event_stream():
        try:
            async for update in _agent.followup(
                question=req.question,
                topic=req.topic,
                report_summary=req.report_summary,
            ):
                yield f"data: {json.dumps(update)}\n\n"
        except Exception as exc:
            error_event = {"step": "error", "message": str(exc), "data": None}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/export-pdf")
async def export_pdf(req: ExportPdfRequest):
    from report_generator import ReportGenerator  # noqa: PLC0415

    generator = ReportGenerator()
    pdf_bytes = generator.generate_pdf(
        report_text=req.report_text,
        topic=req.topic,
        sources=req.sources,
    )

    safe_topic = req.topic[:40].replace(" ", "_").replace("/", "-")
    filename = f"scholarmind_{safe_topic}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
