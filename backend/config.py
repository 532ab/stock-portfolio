from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stockportfolio"
    jwt_secret: str = "change-this-to-a-real-secret"
    finnhub_api_key: str = "d1t74k9r01qh0t057ov0d1t74k9r01qh0t057ovg"
    alpha_vantage_api_key: str = "YWFSAN4Q2XHJKK7J"

    class Config:
        env_file = ".env"


settings = Settings()
