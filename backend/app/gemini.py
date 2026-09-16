import json
import os

from google import genai
from google.genai import types

VERDICT_STATES = {"supported", "partial", "misleading", "contradicted", "insufficient"}


def quick_verdict(title: str, description: str | None, link: str) -> dict:
    """Synchronous on purpose: FastAPI runs a sync route in its threadpool,
    which keeps this blocking SDK call off the event loop without needing
    a separate asyncio.to_thread wrapper at the call site."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in backend/.env")
    model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

    client = genai.Client(api_key=api_key)
    prompt = (
        "You are a fact checking assistant for a news article. Use search to check "
        "the article's central claim against other reporting and primary sources, "
        "then judge how well supported it is.\n\n"
        f"Title: {title}\n"
        f"Description: {description or 'none given'}\n"
        f"Link: {link}\n\n"
        "Respond with ONLY compact JSON, no other text, in exactly this shape: "
        '{"verdict": one of "supported", "partial", "misleading", "contradicted", '
        '"insufficient", "summary": a two sentence plain explanation}'
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(tools=[types.Tool(google_search=types.GoogleSearch())]),
    )

    return _parse_verdict(response.text or "")


def _parse_verdict(text: str) -> dict:
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {"verdict": "insufficient", "summary": text.strip()[:400]}

    try:
        parsed = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return {"verdict": "insufficient", "summary": text.strip()[:400]}

    verdict = parsed.get("verdict")
    if verdict not in VERDICT_STATES:
        verdict = "insufficient"
    return {"verdict": verdict, "summary": parsed.get("summary", "")}
