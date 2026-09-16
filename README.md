<p align="center">
  <img src="public/img_mask.png" alt="TRACE mascot, a zebra investigating claims from a laptop" width="220">
</p>

<h1 align="center">TRACE</h1>
<p align="center"><i>See how claims become truth.</i></p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-111111?style=flat-square">
  <img alt="FastAPI" src="https://img.shields.io/badge/backend-FastAPI-111111?style=flat-square">
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Gemini-111111?style=flat-square">
  <img alt="Status" src="https://img.shields.io/badge/status-in%20progress-111111?style=flat-square">
</p>

TRACE investigates a claim across real sources instead of answering true or false. It maps what supports a claim and what contradicts it, tracks how the claim's meaning drifted as it spread, and shows exactly how the evidence adds up to a five state verdict.

<p align="center">
  <img src="docs/screenshots/landing.png" alt="TRACE landing page" width="800">
</p>

## Why it is different

Most fact checking tools return a single true or false answer. TRACE shows its work instead: which sources it found, whether each one actually supports the claim, how the claim's wording changed from the original research to a social post, and a five state verdict (supported, partially supported, misleading, contradicted, insufficient evidence) rather than a binary one. The evidence quality score is explicitly labeled as a TRACE assessment, not an objective measure of truth.

## How an investigation looks

<p align="center">
  <img src="docs/screenshots/investigation.png" alt="Verdict, evidence quality, and investigation timeline" width="800">
</p>

The evidence map lays the claim, what supports it, and what contradicts it out as a tree, and clicking any source jumps straight to the evidence behind it.

<p align="center">
  <img src="docs/screenshots/evidence-map.png" alt="Evidence map graph and source list" width="800">
</p>

Claim drift is the signature feature: it lines up the original source against the version that spread, and underlines exactly where the meaning shifted.

<p align="center">
  <img src="docs/screenshots/claim-drift.png" alt="Sources list and claim drift comparison" width="800">
</p>

## Navigation

There is no menu bar. A single button sits in the bottom right corner, arrows orbit it to draw the eye, and clicking it opens four docks at once, one per screen edge, each with its own purpose.

<p align="center">
  <img src="docs/screenshots/orbit-nav.png" alt="Orbit navigation open, showing all four docks" width="800">
</p>

```mermaid
flowchart TD
    N((orbit nav))
    N --- T[Top: investigate a claim]
    N --- B[Bottom: ask a question]
    N --- L[Left: session history]
    N --- R[Right: about and source]
```

## News

The News page reads live articles through the backend, and an "Is this true" button on any article gets a real Gemini verdict, grounded with Google Search, right then.

<p align="center">
  <img src="docs/screenshots/news.png" alt="News feed with a resolved verdict" width="800">
</p>

## Built for every screen

<p align="center">
  <img src="docs/screenshots/mobile.png" alt="TRACE on a phone sized screen" width="260">
</p>

## Architecture

```mermaid
flowchart LR
    UI[React frontend] --> API[FastAPI backend]
    API --> NEWS[newsdata.io]
    API --> AI[Gemini, with Google Search grounding]
    NEWS --> UI
    AI --> UI
```

Both API keys stay on the backend, in a `.env` file that is never sent to or read by the browser. The investigation page above still runs on a static mock fixture; the News page and its verdicts are the real backend integration so far.

## Run it locally

TRACE is meant to be run on your own machine with your own keys, not shared as a hosted service.

### 1. Backend

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

### 2. Frontend

```
npm install
npm run dev
```

The frontend talks to the backend at `http://localhost:8000` by default; set `VITE_API_BASE_URL` if it runs somewhere else. The landing and investigation pages need no backend at all, since they run entirely on the mock investigation.

## Stack

React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Flow (`@xyflow/react`), `roughjs`, `lucide-react` on the frontend; FastAPI, `httpx`, `google-genai` on the backend.

## Design

The whole interface is meant to feel hand drawn rather than corporate: black and white, hand drawn shapes via `roughjs`, a handwriting style display font for headings, and a mascot that shows up in the Ask dock instead of a generic bot icon. The five verdict colors are the one deliberate exception to the black and white rule, used only as small functional accents so severity stays scannable at a glance.
