import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FairShift"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fairshift-super-secure-production-ready-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: fallback to sqlite in dev if DATABASE_URL is not PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fairshift.db")
    
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]

settings = Settings()
