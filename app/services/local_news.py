"""Local news by area (city/state) via NewsCatcher. Tries Local News API first; on 401, falls back to main v3 API."""
import logging
from typing import Optional

import httpx

from app.config import NEWSCATCHER_API_KEY

logger = logging.getLogger(__name__)

LOCAL_NEWS_URL = "https://local-news.newscatcherapi.com/api/search"
MAIN_API_URL = "https://v3-api.newscatcherapi.com/api/search"
TIMEOUT = 15.0
MAX_ARTICLES = 10


def _normalize_articles(data: dict) -> list[dict]:
    """Map API response to list of {title, url, source, published_date}."""
    articles = data.get("articles") or []
    return [
        {
            "title": a.get("title") or "",
            "url": a.get("link") or a.get("url") or "",
            "source": a.get("domain_url") or a.get("rights") or a.get("source"),
            "published_date": a.get("published_date"),
        }
        for a in articles[:MAX_ARTICLES]
        if a.get("title") and (a.get("link") or a.get("url"))
    ]


async def _fetch_local_news_api(client: httpx.AsyncClient, location_str: str) -> tuple[Optional[dict], Optional[int]]:
    """Try Local News API. Returns (data, status_code)."""
    payload = {
        "q": "*",
        "locations": [location_str],
        "detection_methods": ["local_section", "ai_extracted"],
        "lang": "en",
        "from_": "7 days ago",
        "page_size": MAX_ARTICLES,
    }
    headers = {
        "x-api-token": NEWSCATCHER_API_KEY.strip(),
        "Content-Type": "application/json",
    }
    try:
        resp = await client.post(LOCAL_NEWS_URL, json=payload, headers=headers)
        if resp.status_code == 200:
            return resp.json(), resp.status_code
        return None, resp.status_code
    except Exception as e:
        logger.debug("Local News API request error: %s", e)
        return None, None


async def _fetch_main_api(client: httpx.AsyncClient, location_str: str) -> list[dict]:
    """Fallback: main NewsCatcher v3 API with location as search query (e.g. 'San Jose California')."""
    payload = {
        "q": location_str,
        "lang": "en",
        "countries": "US",
        "from_": "7 days ago",
        "page_size": MAX_ARTICLES,
    }
    headers = {
        "x-api-token": NEWSCATCHER_API_KEY.strip(),
        "Content-Type": "application/json",
    }
    try:
        resp = await client.post(MAIN_API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        return _normalize_articles(resp.json())
    except Exception as e:
        logger.warning("NewsCatcher main API fallback failed for %s: %s", location_str, e)
        return []


async def get_local_news(
    city: Optional[str] = None,
    state: Optional[str] = None,
) -> list[dict]:
    """
    Fetch local news for the given area. Tries Local News API first.
    If that returns 401 (key not authorized for Local News), falls back to main v3 API
    using city/state as search query so the same key still returns location-relevant news.
    Returns list of {title, url, source, published_date}.
    """
    if not NEWSCATCHER_API_KEY or not NEWSCATCHER_API_KEY.strip():
        return []

    location_parts = []
    if city and city.strip():
        location_parts.append(city.strip())
    if state and state.strip():
        location_parts.append(state.strip())
    if not location_parts:
        return []

    location_str = ", ".join(location_parts)

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        data, status = await _fetch_local_news_api(client, location_str)

        if data is not None and status == 200:
            return _normalize_articles(data)

        if status == 401:
            logger.info(
                "NewsCatcher Local News API returned 401 (this key does not have Local News access). "
                "Using main News API with location search instead."
            )
        elif status is not None:
            logger.warning("Local news fetch failed for %s: HTTP %s. Trying main API.", location_str, status)

        return await _fetch_main_api(client, location_str)
