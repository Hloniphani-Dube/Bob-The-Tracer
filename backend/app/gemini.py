import json
import os
import re
from datetime import datetime, timezone

from google import genai
from google.genai import types

VERDICT_STATES = {"supported", "partial", "misleading", "contradicted", "insufficient"}
SOURCE_TYPES = {
    "scientific study",
    "research review",
    "scientific article",
    "news article",
    "government source",
    "primary document",
}
RELATIONSHIPS = {"supports", "contradicts", "neutral"}
STRENGTHS = {"low", "medium", "high"}
SCORE_KEYS = ("authority", "recency", "primaryEvidence", "corroboration", "relevance")


def _client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in backend/.env")
    return genai.Client(api_key=api_key)


def _model() -> str:
    return os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")


def _generate(prompt: str) -> str:
    # Keep the client bound to a variable rather than chaining the call
    # straight off _client(): a known bug in google-genai closes the
    # underlying httpx client while the request is still in flight when the
    # Client is used as a temporary object instead of staying in scope.
    client = _client()
    response = client.models.generate_content(
        model=_model(),
        contents=prompt,
        config=types.GenerateContentConfig(tools=[types.Tool(google_search=types.GoogleSearch())]),
    )
    return response.text or ""


def _extract_json(text: str) -> dict | None:
    """Gemini is asked for bare JSON but sometimes wraps it in a markdown
    fence or adds a stray sentence around it, so this strips fences first
    and then falls back to the outermost pair of braces."""
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    candidate = fenced.group(1) if fenced else text

    start, end = candidate.find("{"), candidate.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(candidate[start : end + 1])
    except json.JSONDecodeError:
        return None


def quick_verdict(title: str, description: str | None, link: str) -> dict:
    """Synchronous on purpose: FastAPI runs a sync route in its threadpool,
    which keeps this blocking SDK call off the event loop without needing
    a separate asyncio.to_thread wrapper at the call site."""
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

    parsed = _extract_json(_generate(prompt))
    if parsed is None:
        return {"verdict": "insufficient", "summary": "Could not reach a verdict for this article."}

    verdict = parsed.get("verdict")
    if verdict not in VERDICT_STATES:
        verdict = "insufficient"
    return {"verdict": verdict, "summary": parsed.get("summary", "")}


INVESTIGATE_PROMPT = """You are TRACE, an evidence investigation assistant. Investigate the claim below using search: find real sources, judge whether each one actually supports or contradicts the claim, and rate how strong the overall evidence is. Do not invent sources; only use ones you actually found.

Claim: "{claim}"

Respond with ONLY compact JSON, no markdown fence, no commentary, in exactly this shape:

{{
  "verdict": one of "supported", "partial", "misleading", "contradicted", "insufficient",
  "verdictSummary": a two or three sentence plain explanation of the verdict,
  "evidenceQuality": integer 0 to 100, how strong and well corroborated the evidence is overall,
  "sources": [
    {{
      "title": the source's real title or headline,
      "type": one of "scientific study", "research review", "scientific article", "news article", "government source", "primary document",
      "publishedYear": integer, best estimate if not stated,
      "url": the real URL,
      "relationship": one of "supports", "contradicts", "neutral",
      "strength": one of "low", "medium", "high",
      "excerpt": a one or two sentence excerpt or paraphrase of what it actually says about the claim,
      "score": {{
        "authority": 0 to 100, how credible this source is for this subject,
        "recency": 0 to 100, how recent the information is,
        "primaryEvidence": 0 to 100, is this the original research or data rather than a report about it,
        "corroboration": 0 to 100, do independent sources agree with it,
        "relevance": 0 to 100, does it actually address this claim
      }}
    }}
  ],
  "claimDrift": [
    {{ "label": "Original source", "text": the earliest or most primary framing you found, in its own words }},
    {{ "label": "As stated", "text": the claim as given above, "changedPhrase": the short phrase that most changed the meaning from the original, omit this field if the wording did not meaningfully shift }}
  ]
}}

Include three to six sources, covering both supporting and contradicting evidence where it genuinely exists. Only include claimDrift if you found a clear original source to compare against; otherwise return an empty array for it."""


def investigate(claim: str) -> dict:
    """Synchronous for the same reason as quick_verdict: the route that
    calls this is a sync def, so FastAPI runs it in its threadpool."""
    parsed = _extract_json(_generate(INVESTIGATE_PROMPT.format(claim=claim)))
    if parsed is None:
        return _fallback_investigation(claim)

    verdict = parsed.get("verdict")
    if verdict not in VERDICT_STATES:
        verdict = "insufficient"

    sources = [_clean_source(s, i) for i, s in enumerate(parsed.get("sources") or [])]
    claim_drift = [_clean_drift_step(s) for s in (parsed.get("claimDrift") or [])]

    return {
        "claim": claim,
        "verdict": verdict,
        "verdictSummary": parsed.get("verdictSummary") or "",
        "evidenceQuality": _clamp_int(parsed.get("evidenceQuality"), default=0),
        "timeline": _build_timeline(sources),
        "sources": sources,
        "claimDrift": claim_drift,
    }


def _clean_source(raw: dict, index: int) -> dict:
    raw_score = raw.get("score") or {}
    try:
        published_year = int(raw.get("publishedYear"))
    except (TypeError, ValueError):
        published_year = datetime.now(timezone.utc).year

    return {
        "id": f"source-{index + 1}",
        "title": raw.get("title") or "Untitled source",
        "type": raw.get("type") if raw.get("type") in SOURCE_TYPES else "news article",
        "publishedYear": published_year,
        "url": raw.get("url") or "",
        "relationship": raw.get("relationship") if raw.get("relationship") in RELATIONSHIPS else "neutral",
        "strength": raw.get("strength") if raw.get("strength") in STRENGTHS else "medium",
        "excerpt": raw.get("excerpt") or "",
        "score": {key: _clamp_int(raw_score.get(key), default=50) for key in SCORE_KEYS},
    }


def _clean_drift_step(raw: dict) -> dict:
    step = {"label": raw.get("label") or "", "text": raw.get("text") or ""}
    if raw.get("changedPhrase"):
        step["changedPhrase"] = raw["changedPhrase"]
    return step


def _clamp_int(value: object, default: int) -> int:
    try:
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return default


def _build_timeline(sources: list[dict]) -> list[dict]:
    supporting = sum(1 for s in sources if s["relationship"] == "supports")
    contradicting = sum(1 for s in sources if s["relationship"] == "contradicts")
    steps = [
        "Claim identified",
        "Claim decomposed",
        f"{len(sources)} source{'s' if len(sources) != 1 else ''} reviewed",
        f"{supporting} supporting source{'s' if supporting != 1 else ''}",
        f"{contradicting} contradicting source{'s' if contradicting != 1 else ''}",
        "Evidence compared",
    ]
    return [{"label": label, "done": True} for label in steps]


def _fallback_investigation(claim: str) -> dict:
    return {
        "claim": claim,
        "verdict": "insufficient",
        "verdictSummary": "TRACE could not complete a structured investigation for this claim. Try rephrasing it or investigating again.",
        "evidenceQuality": 0,
        "timeline": [{"label": "Claim identified", "done": True}],
        "sources": [],
        "claimDrift": [],
    }
