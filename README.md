# ScholarMind

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Anthropic](https://img.shields.io/badge/Anthropic-Claude%20Sonnet%204.5-orange?logo=anthropic)
![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-purple)

**ScholarMind** is a Multi-Step Academic Research Agent that takes any research topic and autonomously produces a structured academic report with citations. It was built as the final capstone project for the AUEB *AI for Developers* programme.

ScholarMind demonstrates the complete modern AI engineering stack: Prompt Engineering, Retrieval-Augmented Generation (RAG), AI Agents with Tool Use, and a real-time streaming API built with FastAPI — all wired to a polished React + TypeScript frontend.

When you submit a research topic, ScholarMind's agent pipeline springs into action: it uses Claude to decompose the topic into 4-5 focused sub-questions, rewrites each into an optimised web search query, fetches live results from DuckDuckGo, synthesises the findings with confidence scoring, stores everything in a local ChromaDB vector store, and finally writes a full academic report in Markdown with an APA reference list. The entire process streams live to the UI so you can watch every step unfold in real time.

After the report is ready, you can ask follow-up questions. ScholarMind retrieves the most relevant stored findings via semantic similarity search and answers using the full context of the report — functioning as a persistent, topic-aware research assistant. Reports can be exported as professionally formatted PDFs.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        ScholarMind Pipeline                         │
│                                                                     │
│   User Input (topic)                                                │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────────┐                                               │
│   │  PLAN (Claude)  │  ← PLANNER_PROMPT → 4-5 sub-questions        │
│   └────────┬────────┘                                               │
│            │  for each sub-question:                                │
│            ▼                                                        │
│   ┌──────────────────────┐                                          │
│   │ REWRITE (Claude)     │  ← QUERY_REWRITER_PROMPT → search query │
│   └──────────┬───────────┘                                          │
│              │                                                      │
│              ▼                                                      │
│   ┌──────────────────────┐                                          │
│   │ SEARCH (DuckDuckGo)  │  ← duckduckgo-search → top 5 results    │
│   └──────────┬───────────┘                                          │
│              │                                                      │
│              ▼                                                      │
│   ┌──────────────────────┐                                          │
│   │ SYNTHESIZE (Claude)  │  ← SEARCH_SYNTHESIZER_PROMPT            │
│   │  facts + sources     │    → {facts, sources, confidence}        │
│   └──────────┬───────────┘                                          │
│              │                                                      │
│              ▼                                                      │
│   ┌──────────────────────┐                                          │
│   │  STORE (ChromaDB)    │  ← sentence-transformers embeddings      │
│   │  all-MiniLM-L6-v2    │    → PersistentClient vector store       │
│   └──────────────────────┘                                          │
│            │  (after all sub-questions)                             │
│            ▼                                                        │
│   ┌──────────────────────┐                                          │
│   │ RETRIEVE (ChromaDB)  │  ← top-10 semantic search               │
│   └──────────┬───────────┘                                          │
│              │                                                      │
│              ▼                                                      │
│   ┌──────────────────────┐                                          │
│   │  WRITE (Claude)      │  ← REPORT_WRITER_PROMPT → Markdown       │
│   │  Academic Report     │    report with APA references            │
│   └──────────────────────┘                                          │
│                                                                     │
│   Follow-up Q&A                                                     │
│   question → RAG retrieve → FOLLOWUP_PROMPT → Claude stream        │
│                                                                     │
│   PDF Export → ReportLab → professional multi-page PDF             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐   SSE stream   ┌──────────────────┐
│   React +    │ ◄──────────── │    FastAPI +      │
│  TypeScript  │   /api/...    │  ResearchAgent    │
│    (Vite)    │ ─────────────► │  (Python async)   │
└──────────────┘               └──────────────────┘
```

---

## Tech Stack

| Layer        | Technology                               | Purpose                             |
|--------------|------------------------------------------|-------------------------------------|
| **Backend**  | Python 3.11+, FastAPI, uvicorn           | API server, async streaming         |
| **LLM**      | Anthropic Claude Sonnet 4.5 (direct SDK) | Planning, synthesis, report writing |
| **RAG**      | sentence-transformers (all-MiniLM-L6-v2) | Local semantic embeddings           |
| **VectorDB** | ChromaDB (PersistentClient)              | Finding storage & retrieval         |
| **Search**   | duckduckgo-search (DDGS)                 | Free, no-key web search             |
| **PDF**      | ReportLab                                | Professional PDF export             |
| **Frontend** | React 19, TypeScript, Vite               | Real-time streaming UI              |
| **Styling**  | Tailwind CSS v4 (@tailwindcss/vite)      | Dark-theme UI                       |

---

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- An [Anthropic API key](https://console.anthropic.com/)

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd scholarmind
```

### 2. Configure environment

```bash
cp .env.example backend/.env
# Edit backend/.env and set ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start the backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Usage

1. **Enter a research topic** in the search bar and press *Research*
2. **Watch the pipeline** — Plan → Search → Synthesize → Write nodes light up in real time
3. **Follow the activity log** to see exactly what the agent is doing
4. **Read the sub-questions** as they are generated and tracked
5. **Receive the full report** rendered in Markdown with citations
6. **Ask follow-up questions** — ScholarMind uses RAG to answer from stored findings
7. **Export PDF** — download a professionally formatted report

### Example Research Topics

| Topic                                                                | What ScholarMind explores                                                                                            |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| *The impact of large language models on scientific research*         | History of NLP, current LLM capabilities, research acceleration, peer review implications, future directions         |
| *Quantum computing applications in cryptography*                     | Quantum gates, Shor's algorithm, post-quantum standards, current hardware, timeline to threat                        |
| *CRISPR gene editing: current capabilities and ethical implications* | CRISPR-Cas9 mechanism, clinical trials, germline editing debates, regulatory landscape, future of precision medicine |

---

## API Reference

### `GET /api/health`

Returns server status.

**Response:** `{"status": "ok", "model": "claude-sonnet-4-5"}`

---

### `POST /api/research`

Starts a research session. Returns an SSE stream.

**Request body:**

```json
{ "topic": "string" }
```

**SSE events** (`data: <json>\n\n`):

| `step`         | `data`                             | Description                  |
|----------------|------------------------------------|------------------------------|
| `planning`     | `string[]` sub-questions           | Research plan ready          |
| `searching`    | `null`                             | Searching for a sub-question |
| `synthesizing` | `{facts, confidence}`              | Synthesis complete           |
| `writing`      | `null`                             | Writing report               |
| `complete`     | `{report, sources, sub_questions}` | All done                     |
| `error`        | `null`                             | Something went wrong         |

---

### `POST /api/followup`

Answers a follow-up question with RAG context. Returns an SSE stream.

**Request body:**

```json
{
  "question": "string",
  "topic": "string",
  "report_summary": "string"
}
```

**SSE events:**

```json
{"step": "followup", "message": "<text chunk>", "done": false}
{"step": "followup", "message": "", "done": true}
```

---

### `POST /api/export-pdf`

Generates a PDF and returns it as a binary download.

**Request body:**

```json
{
  "report_text": "string",
  "topic": "string",
  "sources": [{"title": "...", "url": "...", "snippet": "..."}]
}
```

**Response:** `application/pdf` binary stream.

---

## Project Structure

```text
scholarmind/
├── backend/
│   ├── main.py              # FastAPI app, CORS, all 4 endpoints
│   ├── agent.py             # ResearchAgent: full pipeline + follow-up streaming
│   ├── tools.py             # web_search, store_finding, retrieve_context
│   ├── rag.py               # RAGPipeline: embed, add_finding, retrieve, clear
│   ├── report_generator.py  # ReportGenerator: PDF (ReportLab) + format_for_display
│   └── prompts.py           # All 5 Claude prompt templates
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Root layout, dark theme
│   │   ├── components/
│   │   │   ├── SearchBar.tsx          # Topic input + example suggestions
│   │   │   ├── PipelineView.tsx       # 4-node animated pipeline
│   │   │   ├── ActivityFeed.tsx       # Auto-scrolling log
│   │   │   ├── SubQuestions.tsx       # Numbered list with fade-in
│   │   │   ├── ReportPanel.tsx        # Markdown report + sources + PDF export
│   │   │   └── FollowUp.tsx           # Streaming Q&A chat
│   │   ├── hooks/
│   │   │   └── useResearch.ts         # All SSE logic, state machine, exportPdf
│   │   └── types/
│   │       └── index.ts               # AgentUpdate, Source, ResearchState, QAPair
├── data/
│   └── chroma_db/           # ChromaDB persistent vector store
├── requirements.txt
├── .env.example
└── README.md
```

---

## AUEB AI for Developers Curriculum Mapping

| Module       | Concept                              | Where in ScholarMind                                                                                                         |
|--------------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **Module 2** | Prompt Engineering                   | `backend/prompts.py` — 5 structured prompts: PLANNER, QUERY_REWRITER, SEARCH_SYNTHESIZER, REPORT_WRITER, FOLLOWUP            |
| **Module 3** | RAG (Retrieval-Augmented Generation) | `backend/rag.py` — sentence-transformers embeddings + ChromaDB PersistentClient; used in follow-up and report building       |
| **Module 4** | AI Agents with Tool Use              | `backend/agent.py` — ResearchAgent orchestrates 6-step pipeline with `web_search`, `store_finding`, `retrieve_context` tools |
| **Module 5** | LLM API Integration & Deployment     | `backend/main.py` — FastAPI with SSE streaming, `agent.py` uses `anthropic.Anthropic()` SDK directly with streaming support  |

---

ScholarMind — AUEB AI for Developers Final Project
