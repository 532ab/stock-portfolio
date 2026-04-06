from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from database import get_db
from models import Holding
from schemas import AddStockRequest, HoldingResponse
from auth import get_current_user
from config import settings

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


async def fetch_quote(ticker: str) -> tuple[float, float]:
    """Fetch current price and change percent. Returns (price, changePercent)."""
    async with httpx.AsyncClient(timeout=5.0) as client:
        # Try Finnhub first
        try:
            resp = await client.get(
                "https://finnhub.io/api/v1/quote",
                params={"symbol": ticker, "token": settings.finnhub_api_key},
            )
            data = resp.json()
            if data.get("c") and data["c"] > 0:
                return data["c"], data.get("dp", 0)
        except Exception:
            pass

        # Fallback to Alpha Vantage
        try:
            resp = await client.get(
                "https://www.alphavantage.co/query",
                params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker,
                    "apikey": settings.alpha_vantage_api_key,
                },
            )
            data = resp.json().get("Global Quote", {})
            price = float(data.get("05. price", 0))
            change_str = data.get("10. change percent", "0%").replace("%", "")
            if price > 0:
                return price, float(change_str)
        except Exception:
            pass

    return 0, 0


@router.get("/", response_model=list[HoldingResponse])
async def get_portfolio(
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Holding).where(Holding.user_id == user_id))
    holdings = result.scalars().all()

    response = []
    for h in holdings:
        price, change_percent = await fetch_quote(h.ticker)
        if price == 0:
            price = h.purchase_price or 100

        total_value = price * h.quantity
        cost_basis = h.purchase_price * h.quantity
        gain_loss = total_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0

        response.append(HoldingResponse(
            id=h.id,
            ticker=h.ticker,
            quantity=h.quantity,
            purchasePrice=h.purchase_price,
            price=price,
            changePercent=change_percent,
            totalValue=total_value,
            costBasis=cost_basis,
            gainLoss=gain_loss,
            gainLossPercent=gain_loss_percent,
        ))

    return response


@router.post("/", response_model=HoldingResponse, status_code=201)
async def add_stock(
    body: AddStockRequest,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticker = body.ticker.upper()
    if body.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    price, _ = await fetch_quote(ticker)
    if price == 0:
        price = 100

    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.ticker == ticker)
    )
    existing = result.scalar_one_or_none()

    if existing:
        old_value = existing.purchase_price * existing.quantity
        new_value = price * body.quantity
        new_quantity = existing.quantity + body.quantity
        existing.purchase_price = (old_value + new_value) / new_quantity
        existing.quantity = new_quantity
        holding = existing
    else:
        holding = Holding(
            user_id=user_id,
            ticker=ticker,
            quantity=body.quantity,
            purchase_price=price,
        )
        db.add(holding)

    await db.commit()
    await db.refresh(holding)

    return HoldingResponse(
        id=holding.id,
        ticker=holding.ticker,
        quantity=holding.quantity,
        purchasePrice=holding.purchase_price,
    )


@router.delete("/{ticker}")
async def delete_stock(
    ticker: str,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticker = ticker.upper()
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.ticker == ticker)
    )
    holding = result.scalar_one_or_none()
    if holding:
        await db.delete(holding)
        await db.commit()

    return {"message": "Stock deleted"}
