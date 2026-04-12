<div align="center">

<br/>

<img src="https://img.icons8.com/fluency/96/brain.png" width="80" alt="ScholarMind"/>

# `ScholarMind`

### ⚡ _Multi-Step Academic Research Agent_

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Claude](https://img.shields.io/badge/Claude_Sonnet_4.5-D4A574?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)
[![LangChain](https://img.shields.io/badge/LangChain-ReAct-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6F61?style=for-the-badge)](https://trychroma.com)

<br/>

**Drop a topic. Watch the agent think. Get a publication-ready report.**

_ScholarMind autonomously decomposes research questions, searches the web,_
_synthesizes sources with confidence scoring, and writes citation-rich academic reports._

<br/>

[⚡ Quick Start](#-quick-start) •
[🏛️ Architecture](#%EF%B8%8F-architecture) •
[✨ Features](#-features) •
[🧬 Tech Stack](#-tech-stack) •
[📡 API](#-api-reference) •
[🗂️ Structure](#%EF%B8%8F-project-structure)

---

</div>

<br/>

## ✨ Features

```
 🔬  Multi-Step Pipeline    →  Autonomous sub-question decomposition & parallel research
 🌐  Live Web Search        →  DuckDuckGo integration, real-time source retrieval
 🧩  RAG Synthesis          →  ChromaDB + sentence-transformers semantic embeddings
 📊  Confidence Scoring     →  Every fact scored 0.0–1.0 for reliability
 📝  Citation Tracking      →  Full attribution with APA & IEEE formatting
 📡  SSE Streaming          →  Watch every step live: plan → search → synthesize → write
 📑  PDF Export             →  One-click ReportLab PDF with title page, TOC & references
 💬  Follow-Up Q&A          →  Context-grounded answers from stored research
 🎯  ReAct Agent            →  LangChain tool-use agent for dynamic decision-making
```

<br/>

## 🏛️ Architecture

```
                              ┌─────────────────┐
                              │   User Query     │
                              └────────┬────────┘
                                       │
                    ┌──────────────────────────────────────┐
                    │         🤖 ResearchAgent              │
                    │                                      │
                    │  ┌──────────┐    ┌──────────────┐    │
                    │  │  1 PLAN  │───▶│ Sub-Questions │    │
                    │  └──────────┘    └──────┬───────┘    │
                    │                         │ ×4-5       │
                    │              ┌──────────▼─────────┐  │
                    │              │   2 REWRITE query   │  │
                    │              └──────────┬─────────┘  │
                    │              ┌──────────▼─────────┐  │
                    │              │   3 SEARCH  web    │  │
                    │              └──────────┬─────────┘  │
                    │              ┌──────────▼─────────┐  │
                    │              │  4 SYNTHESIZE facts │  │
                    │              └──────────┬─────────┘  │
                    │              ┌──────────▼─────────┐  │
                    │              │   5 STORE  → RAG   │  │
                    │              └──────────┬─────────┘  │
                    │                         │            │
                    │  ┌──────────────────────▼─────────┐  │
                    │  │  6 WRITE — Academic Report     │  │
                    │  └────────────────────────────────┘  │
                    └──────────────────────────────────────┘
                            │                    ▲
                    SSE Stream ▼              │ Follow-up
               ┌──────────────────┐    ┌─────┴──────┐
               │  React/TS/Vite   │    │  RAG Q&A   │
               │  Pipeline UI     │    │  ChromaDB  │
               └──────────────────┘    └────────────┘
```

<br/>

## 🧬 Tech Stack

| Layer | Tech | Role |
|:---:|:---|:---|
| 🖥️ | **FastAPI** + Python 3.11 | Async API server, SSE streaming |
| 🧠 | **Claude Sonnet 4.5** (Anthropic SDK) | Planning, synthesis, report writing |
| 🔗 | **LangChain** ReAct Agent | Tool orchestration & decision-making |
| 📐 | **sentence-transformers** (MiniLM-L6-v2) | Local semantic embeddings |
| 💾 | **ChromaDB** PersistentClient | Vector storage & similarity search |
| 🔍 | **DDGS** (DuckDuckGo Search) | Free, no-key web search |
| 📄 | **ReportLab** | Professional PDF generation |
| ⚛️ | **React 19** + TypeScript + Vite | Real-time streaming frontend |
| 🎨 | **Tailwind CSS v4** | Dark-theme UI styling |

<br/>

## ⚡ Quick Start

> **Prerequisites:** Python 3.11+ · Node.js 18+ · [Anthropic API Key](https://console.anthropic.com)

```bash
# 1 — Clone & configure
git clone https://github.com/GiorgosPanagopoulos/ScholarMind.git
cd ScholarMind
cp .env.example .env
# → set ANTHROPIC_API_KEY in .env

# 2 — Backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# 3 — Frontend (new terminal)
cd frontend && npm install && npm run dev
```

> 🟢 Backend → `http://localhost:8000` · Frontend → `http://localhost:5173`

<br/>

## 🔄 Usage

```
1.  Enter a research topic          →  "Impact of LLMs on scientific research"
2.  Watch the pipeline animate      →  Plan → Search → Synthesize → Write
3.  Track the activity feed         →  Real-time agent decision log
4.  Read the structured report      →  Markdown with inline citations
5.  Ask follow-up questions         →  RAG-powered contextual answers
6.  Export PDF                      →  Professional academic format
```

### 💡 Example Topics

| Topic | ScholarMind Explores |
|:---|:---|
| _Large language models in scientific research_ | NLP history → LLM capabilities → research acceleration → peer review → future |
| _Quantum computing & cryptography_ | Quantum gates → Shor's algorithm → post-quantum standards → hardware timeline |
| _CRISPR gene editing ethics_ | Cas9 mechanism → clinical trials → germline debates → regulation → precision medicine |

<br/>

## 📡 API Reference

### `GET /api/health`
```json
{ "status": "ok", "model": "claude-sonnet-4-5" }
```

### `POST /api/research`
Start a research session → returns **SSE stream**

```json
// Request
{ "topic": "string" }
```

| Event `step` | `data` | Description |
|:---|:---|:---|
| `planning` | `string[]` | Sub-questions generated |
| `searching` | `null` | Web search in progress |
| `synthesizing` | `{facts, confidence}` | Facts extracted & scored |
| `writing` | `null` | Report generation |
| `complete` | `{report, sources, sub_questions}` | Done |

### `POST /api/followup`
RAG-powered follow-up → returns **SSE stream**

```json
{ "question": "string", "topic": "string", "report_summary": "string" }
```

### `POST /api/export-pdf`
Returns `application/pdf` binary

```json
{ "report_text": "string", "topic": "string", "sources": [...] }
```

<br/>

## 🗂️ Project Structure

```
scholarmind/
├── backend/
│   ├── main.py               # FastAPI endpoints + CORS + SSE
│   ├── agent.py              # ResearchAgent — 6-step pipeline
│   ├── tools.py              # web_search · store_finding · retrieve_context
│   ├── rag.py                # RAGPipeline — embed, store, retrieve, clear
│   ├── report_generator.py   # PDF export + Markdown formatter
│   └── prompts.py            # 5 structured Claude prompt templates
├── frontend/
│   └── src/
│       ├── App.tsx            # Root layout, dark theme
│       ├── components/
│       │   ├── SearchBar.tsx       # Topic input + suggestions
│       │   ├── PipelineView.tsx    # 4-node animated pipeline
│       │   ├── ActivityFeed.tsx    # Auto-scrolling log
│       │   ├── SubQuestions.tsx    # Numbered list + fade-in
│       │   ├── ReportPanel.tsx     # Markdown + sources + PDF
│       │   └── FollowUp.tsx        # Streaming Q&A
│       ├── hooks/
│       │   └── useResearch.ts      # SSE logic + state machine
│       └── types/
│           └── index.ts            # AgentUpdate · Source · ResearchState
├── data/chroma_db/            # ChromaDB persistent store
├── requirements.txt
├── .env.example
└── README.md
```

<br/>

## 🎓 AUEB Curriculum Mapping

> Final capstone project — **AUEB _AI for Developers_ Programme** (ΚΕΔΙΒΙΜ/ΟΠΑ, 2026)

| Module | Concept | Implementation |
|:---:|:---|:---|
| `02` | Prompt Engineering | 5 structured prompts in `prompts.py` |
| `03` | RAG | sentence-transformers + ChromaDB pipeline |
| `04` | AI Agents & Tool Use | ReAct agent with 3 custom tools |
| `05` | LLM API & Deployment | FastAPI + Anthropic SDK + SSE streaming |

<br/>

## 📄 License

MIT

<br/>

---

<div align="center">

<br/>

### ⚡ Built by

**Georgios Panagopoulos**

Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-GiorgosPanagopoulos-181717?style=flat-square&logo=github)](https://github.com/GiorgosPanagopoulos)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Georgios_Panagopoulos-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/georgios-panagopoulos-9253842ba)

<sub>☕ Powered by mass amounts of caffeine & mass amounts of curiosity</sub>

</div>
