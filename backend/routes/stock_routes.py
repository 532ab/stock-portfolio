import time
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query, HTTPException
import httpx

from config import settings

router = APIRouter(prefix="/api", tags=["stock"])

# Simple in-memory cache: { symbol: { "data": [...], "timestamp": float } }
_cache: dict[str, dict] = {}
CACHE_DURATION = 3600  # 1 hour in seconds


def _generate_mock_data(symbol: str) -> list[dict]:
    """Generate 60 days of realistic mock price data."""
    data = []
    price = random.uniform(100, 300)
    today = datetime.now(timezone.utc)

    for i in range(60, 0, -1):
        date = today - timedelta(days=i)
        price += (random.random() - 0.5) * price * 0.04
        price = max(price, 1)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(price, 2),
        })

    return data


@router.get("/stock-prices")
async def get_stock_prices(symbol: str = Query(..., description="Stock ticker symbol")):
    symbol = symbol.upper()

    # Check cache
    cached = _cache.get(symbol)
    if cached and (time.time() - cached["timestamp"]) < CACHE_DURATION:
        return cached["data"]

    # Fetch from Finnhub
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            now = int(time.time())
            from_ts = now - (60 * 86400)  # 60 days ago

            resp = await client.get(
                "https://finnhub.io/api/v1/stock/candle",
                params={
                    "symbol": symbol,
                    "resolution": "D",
                    "from": from_ts,
                    "to": now,
                    "token": settings.finnhub_api_key,
                },
            )
            data = resp.json()

            if data.get("s") == "ok" and data.get("t") and data.get("c"):
                result = [
                    {
                        "date": datetime.fromtimestamp(t, tz=timezone.utc).strftime("%Y-%m-%d"),
                        "close": round(c, 2),
                    }
                    for t, c in zip(data["t"], data["c"])
                ]
                _cache[symbol] = {"data": result, "timestamp": time.time()}
                return result
        except Exception:
            pass

    # Fallback to mock data
    result = _generate_mock_data(symbol)
    _cache[symbol] = {"data": result, "timestamp": time.time()}
    return result
