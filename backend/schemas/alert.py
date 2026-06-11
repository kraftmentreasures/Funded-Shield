from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class AlertSeverityEnum(str, Enum):
    INFO = "info"
    WARNING = "warning"
    DANGER = "danger"
    CRITICAL = "critical"


class AlertResponse(BaseModel):
    id: str
    user_id: str
    account_id: str
    account_name: str = ""
    alert_type: str
    severity: str
    message: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    alerts: list[AlertResponse]
    total: int


class AlertFilterParams(BaseModel):
    account_id: UUID | None = None
    severity: str | None = None
    alert_type: str | None = None
    status: str | None = None
    limit: int = Field(default=100, ge=1, le=500)
