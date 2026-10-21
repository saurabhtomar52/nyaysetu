"""Async pgvector retrieval and persona-aware legal assistant prompts."""

from dataclasses import dataclass
from typing import Literal

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

Persona = Literal["citizen", "student", "advocate"]

PERSONA_PROMPTS: dict[Persona, str] = {
    "citizen": (
        "You are in Citizen Mode. Explain Indian legal concepts in plain language, "
        "define unavoidable legal terms, and suggest practical questions to ask a "
        "qualified professional. State that your response is educational information "
        "and not legal advice."
    ),
    "student": (
        "You are in Student Mode. Teach the issue using the ratio decidendi, identify "
        "relevant Supreme Court precedents only when supported by the retrieved sources, "
        "and distinguish holding, obiter dicta, facts, and procedural posture. Never "
        "invent a citation or case holding."
    ),
    "advocate": (
        "You are in Advocate Mode. Provide structured legal notice drafting templates "
        "with placeholders, issues, facts, relief sought, and a verification checklist. "
        "Do not present a template as a filed legal document and flag where professional "
        "review is required."
    ),
}

COMMON_PROMPT = (
    "Use only the supplied knowledge context. If it does not answer the question, say "
    "so clearly. Do not claim to be a lawyer or create an attorney-client relationship."
)


@dataclass(frozen=True)
class KnowledgeChunk:
    content: str
    source: str
    distance: float


def build_prompt(persona: Persona, question: str, chunks: list[KnowledgeChunk]) -> str:
    context = "\n\n".join(
        f"[Source: {chunk.source}]\n{chunk.content}" for chunk in chunks
    )
    return (
        f"{PERSONA_PROMPTS[persona]}\n{COMMON_PROMPT}\n\n"
        f"Knowledge context:\n{context or '[No matching source documents]'}\n\n"
        f"Question:\n{question}"
    )


async def similarity_search(
    session: AsyncSession,
    embedding: list[float],
    *,
    limit: int = 5,
) -> list[KnowledgeChunk]:
    """Search pgvector using cosine distance, ordered only by relevance distance."""

    if not 1 <= limit <= 20:
        raise ValueError("limit must be between 1 and 20")
    if not embedding:
        raise ValueError("embedding must not be empty")

    query = text(
        """
        SELECT
            content,
            source,
            embedding <=> CAST(:embedding AS vector) AS distance
        FROM legal_knowledge_vectors
        ORDER BY embedding <=> CAST(:embedding AS vector) ASC
        LIMIT :limit
        """
    )
    result = await session.execute(
        query,
        {"embedding": "[" + ",".join(map(str, embedding)) + "]", "limit": limit},
    )
    return [
        KnowledgeChunk(
            content=str(row["content"]),
            source=str(row["source"]),
            distance=float(row["distance"]),
        )
        for row in result.mappings().all()
    ]
