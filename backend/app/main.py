import logging

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from . import gemini, newsdata  # noqa: E402

logger = logging.getLogger("trace")

app = FastAPI(title="TRACE backend")

# No auth or cookies anywhere in this API, and it is meant to run locally /
# self hosted, so a wide open CORS policy trades nothing away in exchange
# for not having to keep it in sync with whatever port Vite picks.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/news")
async def get_news():
    try:
        return {"articles": await newsdata.fetch_latest()}
    except Exception as exc:
        logger.exception("news fetch failed")
        raise HTTPException(status_code=502, detail="Could not load news right now.") from exc


class VerdictRequest(BaseModel):
    title: str
    description: str | None = None
    link: str


@app.post("/api/news/verdict")
def get_verdict(body: VerdictRequest):
    try:
        return gemini.quick_verdict(body.title, body.description, body.link)
    except Exception as exc:
        logger.exception("verdict failed")
        raise HTTPException(status_code=502, detail="Could not get a verdict right now.") from exc


class InvestigateRequest(BaseModel):
    claim: str


@app.post("/api/investigate")
def post_investigate(body: InvestigateRequest):
    claim = body.claim.strip()
    if not claim:
        raise HTTPException(status_code=400, detail="A claim is required.")
    try:
        return gemini.investigate(claim)
    except Exception as exc:
        logger.exception("investigation failed")
        raise HTTPException(status_code=502, detail="Could not investigate that claim right now.") from exc
