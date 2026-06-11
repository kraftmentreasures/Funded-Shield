import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.deps import get_current_active_user, get_db
from models.user import User
from schemas.alert import AlertListResponse, AlertResponse
from services import account_service, alert_service

router = APIRouter()


@router.get("", response_model=AlertListResponse)
def list_alerts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    account_id: uuid.UUID | None = Query(None),
    severity: str | None = Query(None),
    alert_type: str | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
) -> AlertListResponse:
    alerts = alert_service.list_user_alerts(
        db,
        current_user.id,
        account_id=account_id,
        severity=severity,
        alert_type=alert_type,
        status=status,
        limit=limit,
    )

    account_names: dict[uuid.UUID, str] = {}
    results: list[AlertResponse] = []
    for alert in alerts:
        if alert.account_id not in account_names:
            acc = account_service.get_user_account(
                db, current_user.id, alert.account_id
            )
            account_names[alert.account_id] = acc.account_name if acc else "Unknown"
        results.append(
            AlertResponse(
                id=str(alert.id),
                user_id=str(alert.user_id),
                account_id=str(alert.account_id),
                account_name=account_names[alert.account_id],
                alert_type=alert.alert_type,
                severity=alert.severity,
                message=alert.message,
                status=alert.status,
                created_at=alert.created_at,
            )
        )

    return AlertListResponse(alerts=results, total=len(results))
