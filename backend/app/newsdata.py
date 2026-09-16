import os

import httpx

LATEST_URL = "https://newsdata.io/api/1/latest"


async def fetch_latest() -> list[dict]:
    """One call here costs one newsdata.io credit and returns up to ten
    articles, so callers should fetch on demand, never poll."""
    api_key = os.environ.get("NEWSDATA_API_KEY")
    if not api_key:
        raise RuntimeError("NEWSDATA_API_KEY is not set in backend/.env")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(LATEST_URL, params={"apikey": api_key, "language": "en"})
        response.raise_for_status()
        data = response.json()

    return [
        {
            "id": item.get("article_id"),
            "title": item.get("title"),
            "description": item.get("description"),
            "link": item.get("link"),
            "imageUrl": item.get("image_url"),
            "source": item.get("source_id"),
            "publishedAt": item.get("pubDate"),
        }
        for item in data.get("results", [])
    ]
