import re
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="NyayaConnect AI RAG service", version="1.0.0")
cnr_pattern = re.compile(r"^[A-Za-z0-9]{16}$")


class AssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    persona: Literal["citizen", "advocate", "student"] = "citizen"


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

