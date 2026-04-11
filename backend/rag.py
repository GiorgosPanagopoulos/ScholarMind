"""RAG pipeline: embed + store + retrieve using ChromaDB and sentence-transformers."""

import json
import uuid
from datetime import datetime

import chromadb
from sentence_transformers import SentenceTransformer


class RAGPipeline:
    COLLECTION_NAME = "scholarmind_findings"

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.client = chromadb.PersistentClient(path="./data/chroma_db")
        self.collection = self._get_or_create_collection()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_or_create_collection(self) -> chromadb.Collection:
        return self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def embed(self, text: str) -> list[float]:
        """Embed a single text string and return as a plain Python list."""
        vector = self.model.encode(text, convert_to_numpy=True)
        return vector.tolist()

    def add_finding(
        self,
        sub_question: str,
        facts: list[str],
        sources: list[dict],
        confidence: float,
    ) -> None:
        """Embed sub_question + facts and persist in ChromaDB."""
        combined_text = sub_question + " " + " ".join(facts)
        embedding = self.embed(combined_text)

        self.collection.add(
            ids=[str(uuid.uuid4())],
            embeddings=[embedding],
            documents=[combined_text],
            metadatas=[
                {
                    "sub_question": sub_question,
                    "sources": json.dumps(sources),
                    "confidence": confidence,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ],
        )

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        """Embed query, query ChromaDB, return list of result dicts."""
        count = self.collection.count()
        if count == 0:
            return []

        k = min(top_k, count)
        embedding = self.embed(query)

        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=k,
            include=["documents", "metadatas", "distances"],
        )

        output: list[dict] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]

        for doc, meta in zip(docs, metas):
            sources_raw = meta.get("sources", "[]")
            try:
                sources = json.loads(sources_raw)
            except (json.JSONDecodeError, TypeError):
                sources = []

            output.append(
                {
                    "text": doc,
                    "sources": sources,
                    "confidence": meta.get("confidence", 0.0),
                    "sub_question": meta.get("sub_question", ""),
                }
            )

        return output

    def clear(self) -> None:
        """Delete and recreate the collection for a fresh session."""
        try:
            self.client.delete_collection(self.COLLECTION_NAME)
        except Exception:
            pass
        self.collection = self._get_or_create_collection()
