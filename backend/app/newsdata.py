import os

import httpx

LATEST_URL = "https://newsdata.io/api/1/latest"

# The region a reader can pick on the News page maps to newsdata.io's own
# country codes; "all" is the same combined mix chosen in newsdata.io's
# Query Builder. Keeping the selectable set to exactly these four (rather
# than the full country list newsdata.io supports) matches what was
# actually configured and tested against this account's plan.
COUNTRY_OPTIONS = {
    "all": "za,us,gb,cn",
    "za": "za",
    "us": "us",
    "gb": "gb",
    "cn": "cn",
}
LANGUAGES = "en,zu,af,zh"
CATEGORIES = "breaking,crime,environment,politics,technology"


async def fetch_latest(region: str = "all") -> list[dict]:
    """One call here costs one newsdata.io credit and returns up to ten
    articles, so callers should fetch on demand, never poll."""
    api_key = os.environ.get("NEWSDATA_API_KEY")
    if not api_key:
        raise RuntimeError("NEWSDATA_API_KEY is not set in backend/.env")

    country = COUNTRY_OPTIONS.get(region, COUNTRY_OPTIONS["all"])
    params = {
        "apikey": api_key,
        "country": country,
        "language": LANGUAGES,
        "category": CATEGORIES,
        "image": 1,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(LATEST_URL, params=params)
        response.raise_for_status()
        data = response.json()

    articles = []
    seen_titles = set()
    for item in data.get("results", []):
        # Wire stories (an AP or Reuters piece, say) land in newsdata.io's
        # results once per outlet that ran it, with the same title and
        # description under a different source and link. A normalized
        # title is enough to catch that without dropping genuinely
        # different stories that just happen to share a word or two.
        title = (item.get("title") or "").strip().lower()
        if title and title in seen_titles:
            continue
        seen_titles.add(title)

        articles.append(
            {
                "id": item.get("article_id"),
                "title": item.get("title"),
                "description": item.get("description"),
                "link": item.get("link"),
                "imageUrl": item.get("image_url"),
                "source": item.get("source_id"),
                "publishedAt": item.get("pubDate"),
            }
        )

    return articles
