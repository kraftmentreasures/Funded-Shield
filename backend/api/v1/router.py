from fastapi import APIRouter

from api.v1 import accounts, admin, alerts, auth, health, prop_firms, rules, settings

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(prop_firms.router, prefix="/prop-firms", tags=["prop-firms"])
api_router.include_router(rules.router, prefix="/rules", tags=["rules"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
