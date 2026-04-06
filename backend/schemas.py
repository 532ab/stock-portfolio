from pydantic import BaseModel


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    username: str
    userId: int


class AddStockRequest(BaseModel):
    ticker: str
    quantity: int


class HoldingResponse(BaseModel):
    id: int
    ticker: str
    quantity: int
    purchasePrice: float
    price: float | None = None
    changePercent: float | None = None
    totalValue: float | None = None
    costBasis: float | None = None
    gainLoss: float | None = None
    gainLossPercent: float | None = None
