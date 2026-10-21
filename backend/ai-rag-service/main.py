import re
import os
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from services.rag_engine import KnowledgeChunk, build_prompt, similarity_search

app = FastAPI(title="NyayaConnect AI RAG service", version="1.0.0")
cnr_pattern = re.compile(r"^[A-Za-z0-9]{16}$")


class AssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    persona: Literal["citizen", "advocate", "student"] = "citizen"
    embedding: list[float] | None = Field(default=None, min_length=1, max_length=4096)


class ChatResponse(BaseModel):
    answer: str
    persona: str
    prompt: str
    source_documents: list[str]


database_url = os.environ.get("DATABASE_URL")
session_factory: async_sessionmaker[AsyncSession] | None = None
if database_url:
    session_factory = async_sessionmaker(
        create_async_engine(database_url, pool_pre_ping=True),
        expire_on_commit=False,
    )


async def get_session() -> AsyncSession:
    if session_factory is None:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")
    async with session_factory() as session:
        yield session


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-rag-service"}


@app.get("/api/v1/cases/{cnr}")
async def case_lookup(cnr: str) -> dict[str, str | None]:
    if not cnr_pattern.fullmatch(cnr):
        raise HTTPException(status_code=400, detail="CNR must be exactly 16 alphanumeric characters")
    return {"cnr": cnr.upper(), "status": "adapter-not-configured", "next_hearing": None}


@app.post("/api/v1/assistant/chat")
async def assistant_chat(request: AssistantRequest) -> dict[str, object]:
    return {
        "answer": f"{request.persona.title()} mode is ready for the configured RAG provider.",
        "disclaimer": "This is educational information, not legal advice.",
        "source_documents": [],
    }


@app.post("/api/v1/ai/chat", response_model=ChatResponse)
async def ai_chat(
    request: AssistantRequest,
    session: AsyncSession = Depends(get_session),
) -> ChatResponse:
    if request.embedding is None:
        raise HTTPException(
            status_code=422,
            detail="embedding is required until an embedding provider is configured",
        )
    try:
        chunks: list[KnowledgeChunk] = await similarity_search(
            session,
            request.embedding,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    prompt = build_prompt(request.persona, request.message, chunks)
    return ChatResponse(
        answer=(
            "Retrieved legal context successfully. Connect the approved LLM adapter "
            "to generate the final response from this grounded prompt."
        ),
        persona=request.persona,
        prompt=prompt,
        source_documents=[chunk.source for chunk in chunks],
    )
