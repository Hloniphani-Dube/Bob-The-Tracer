# TRACE

See how claims become truth.

TRACE investigates a claim across real sources instead of answering true or false. It maps what supports a claim and what contradicts it, tracks how the claim's meaning drifted as it spread, and shows exactly how the evidence adds up to a verdict.

## Status

The landing page, the orbit navigation, and the investigation page (verdict, evidence map, sources, claim drift) are built and driven by one static mock investigation in [src/data/mockInvestigation.ts](src/data/mockInvestigation.ts); that part still has no backend behind it. The News page is real: it reads live articles from newsdata.io through the FastAPI backend in `backend/`, and its "Is this true" check is a real Gemini call (with Google Search grounding) done right when you ask for it, not the full evidence map investigation yet.

## Why it is different

Most fact checking tools return a single true or false answer. TRACE instead shows its work: which sources it found, whether each one actually supports the claim, how the claim's wording changed from the original research to a social post, and a five state verdict (supported, partially supported, misleading, contradicted, insufficient evidence) instead of a binary one. The evidence quality score is explicitly labeled as a TRACE assessment, not an objective measure of truth.

## Design

The interface is built to feel hand drawn rather than corporate: black and white, hand drawn shapes via `roughjs`, a handwriting style display font for headings. Navigation is a single button in the bottom right corner instead of a conventional menu. Arrows orbit it to draw attention and fade once noticed; clicking it opens four docks, one per screen edge, each with its own purpose: investigate at the top, ask a question at the bottom, session history on the left, and project info plus the GitHub link on the right.

## Running locally

Both the frontend and the backend run locally, and both API keys stay on the backend; the browser never sees them.

### Backend

```
cd backend
py -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
```

Fill in `backend/.env` with your own keys:

```
NEWSDATA_API_KEY=your newsdata.io key
GEMINI_API_KEY=your Gemini key
GEMINI_MODEL=gemini-3.8-flash
```

Then run it:

```
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Each `GET /api/news` call costs one newsdata.io credit for up to ten articles, so the News page only fetches on load and on a manual refresh, never on a timer.

### Frontend

```
npm install
npm run dev
```

The frontend talks to the backend at `http://localhost:8000` by default; set `VITE_API_BASE_URL` if it runs somewhere else. The investigation page still needs no backend at all, since it runs entirely on the mock investigation.

## Planned architecture

```
React frontend
  down to
FastAPI backend
  down to
newsdata.io for the news feed, Gemini (with Google Search grounding) for verdicts and, eventually, full investigations
  down to
Evidence graph and verdict
```

## Stack

React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Flow (`@xyflow/react`), `roughjs`, `lucide-react` on the frontend; FastAPI, `httpx`, `google-genai` on the backend.
