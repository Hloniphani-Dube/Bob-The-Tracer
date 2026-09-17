import logging

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from google.genai import errors as genai_errors  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from . import gemini, newsdata  # noqa: E402

logger = logging.getLogger("trace")

app = FastAPI(title="TRACE backend")


def _gemini_error_response(exc: Exception) -> HTTPException:
    """RuntimeError here is always one we raised ourselves for a missing key
    (see gemini.py), so it is safe to echo verbatim: it never contains the
    key's value, only which environment variable is unset. A quota error
    (HTTP 429) from Gemini itself gets its own friendly message, since that
    is an account or billing limit, not a bug, and the raw response body is
    not something a reader should have to parse to understand that. Any
    other google-genai APIError shows its own status and message, which
    describe the failure rather than the credential, so surfacing them here
    saves a trip to the Vercel function logs."""
    if isinstance(exc, RuntimeError):
        return HTTPException(status_code=500, detail=str(exc))

    if isinstance(exc, genai_errors.APIError):
        if exc.code == 429:
            return HTTPException(
                status_code=429,
                detail=(
                    "Gemini quota exceeded for this API key. Check your plan and usage at "
                    "https://ai.google.dev/gemini-api/docs/rate-limits, then try again."
                ),
            )
        return HTTPException(status_code=502, detail=f"Gemini request failed: {exc.status or exc.code}: {exc.message}"[:400])

    return HTTPException(status_code=502, detail=f"Gemini request failed: {type(exc).__name__}: {exc}"[:400])

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
async def get_news(region: str = "all"):
    try:
        return {"articles": await newsdata.fetch_latest(region)}
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
        raise _gemini_error_response(exc) from exc


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
        raise _gemini_error_response(exc) from exc
