from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api.v1.router import api_router
from core.config import settings
from core.database import Base, SessionLocal, engine
from models import (  # noqa: F401
    AlertNotification,
    AlertSentKey,
    PropFirm,
    PropFirmRule,
    TradingAccount,
    User,
)
from services.seed_prop_firms import seed_prop_firms


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        seed_prop_firms(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Funded-Shield API", "docs": "/docs"}
