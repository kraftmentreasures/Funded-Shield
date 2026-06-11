from fastapi import APIRouter

from core.database import check_database_connection

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str | bool]:
    db_ok = check_database_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": "funded-shield-api",
        "database": db_ok,
    }
