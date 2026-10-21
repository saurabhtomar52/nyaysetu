from contextlib import asynccontextmanager
from typing import Literal
from uuid import UUID

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    allowed_origins: str = "http://localhost:3000"
    ecourts_api_url: str | None = None
    ecourts_api_key: str | None = None
    llm_api_url: str | None = None
    llm_api_key: str | None = None
    llm_model: str = "inlegalbert"


settings = Settings()


class Advocate(BaseModel):
    id: UUID
    name: str
    district: str
    state: str
    practice_areas: list[str]
    verified: bool
    latitude: float
    longitude: float


class CnrResult(BaseModel):
    cnr: str
    status: str
    court: str
    next_hearing: str | None
    source: Literal["demo", "ecourts"]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    persona: Literal["citizen", "advocate", "student"] = "citizen"


class ChatResponse(BaseModel):
    answer: str
    persona: str
    disclaimer: str
    source_documents: list[str]


DEMO_ADVOCATES = [
    Advocate(
        id="d7c1d0a8-0f6e-4d45-a6bd-7f2d3d3e6a11",
        name="Adv. Ananya Sharma",
        district="New Delhi",
        state="Delhi",
        practice_areas=["Constitutional Law", "Civil Litigation"],
        verified=True,
        latitude=28.6139,
        longitude=77.2090,
    ),
    Advocate(
        id="3eeed7f2-0e54-4a62-bc0a-7bb77d35c210",
        name="Adv. Rohan Iyer",
        district="Bengaluru Urban",
        state="Karnataka",
        practice_areas=["Technology Law", "Commercial Law"],
        verified=True,
        latitude=12.9716,
        longitude=77.5946,
    ),
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="NyayaConnect AI API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[item.strip() for item in settings.allowed_origins.split(",")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-api"}


@app.get("/api/v1/advocates", response_model=list[Advocate])
async def search_advocates(
    district: str = Query(min_length=2, max_length=100),
    practice_area: str | None = Query(default=None, max_length=100),
) -> list[Advocate]:
    district_matches = [
        advocate
        for advocate in DEMO_ADVOCATES
        if district.casefold() in advocate.district.casefold()
        and (
            practice_area is None
            or any(practice_area.casefold() in area.casefold() for area in advocate.practice_areas)
        )
    ]
    return district_matches


@app.get("/api/v1/cases/{cnr}", response_model=CnrResult)
async def lookup_case(cnr: str) -> CnrResult:
    if len(cnr) != 16 or not cnr.isalnum():
        raise HTTPException(status_code=400, detail="CNR must be exactly 16 letters or digits")
    if settings.ecourts_api_url and settings.ecourts_api_key:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{settings.ecourts_api_url.rstrip('/')}/cases/{cnr}",
                headers={"Authorization": f"Bearer {settings.ecourts_api_key}"},
            )
            response.raise_for_status()
            return CnrResult.model_validate(response.json())
    return CnrResult(
        cnr=cnr.upper(),
        status="Pending demo lookup",
        court="eCourts integration not configured",
        next_hearing=None,
        source="demo",
    )


@app.post("/api/v1/assistant/chat", response_model=ChatResponse)
async def assistant_chat(request: ChatRequest) -> ChatResponse:
    if settings.llm_api_url and settings.llm_api_key:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                settings.llm_api_url,
                headers={"Authorization": f"Bearer {settings.llm_api_key}"},
                json={"model": settings.llm_model, "persona": request.persona, "message": request.message},
            )
            response.raise_for_status()
            payload = response.json()
            return ChatResponse(
                answer=payload["answer"],
                persona=request.persona,
                disclaimer="This is educational information, not legal advice.",
                source_documents=payload.get("source_documents", []),
            )
    return ChatResponse(
        answer=f"[{request.persona.title()} mode] I can help you understand Indian legal processes. "
        "For a real answer, connect the configured InLegalBERT/RAG provider.",
        persona=request.persona,
        disclaimer="This is educational information, not legal advice.",
        source_documents=[],
    )

