from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from schemas.prop_firm import PropFirmRuleResponse


class PlatformEnum(str, Enum):
    MT4 = "MT4"
    MT5 = "MT5"


class AccountStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    BREACHED = "breached"


class RiskStatusEnum(str, Enum):
    SAFE = "safe"
    WARNING = "warning"
    DANGER = "danger"
    VIOLATED = "violated"


class AccountBase(BaseModel):
    account_name: str = Field(..., min_length=1, max_length=100)
    prop_firm_id: UUID | None = None
    prop_firm: str = Field(..., min_length=1, max_length=100)
    platform: PlatformEnum
    account_number: str = Field(..., min_length=1, max_length=50)
    starting_balance: Decimal = Field(..., gt=0)
    daily_loss_limit: Decimal = Field(..., gt=0)
    max_drawdown: Decimal = Field(..., gt=0)
    status: AccountStatusEnum = AccountStatusEnum.ACTIVE

    @field_validator("account_name", "prop_firm", "account_number")
    @classmethod
    def strip_strings(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Field cannot be empty")
        return stripped


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    account_name: str | None = Field(None, min_length=1, max_length=100)
    prop_firm_id: UUID | None = None
    prop_firm: str | None = Field(None, min_length=1, max_length=100)
    platform: PlatformEnum | None = None
    account_number: str | None = Field(None, min_length=1, max_length=50)
    starting_balance: Decimal | None = Field(None, gt=0)
    daily_loss_limit: Decimal | None = Field(None, gt=0)
    max_drawdown: Decimal | None = Field(None, gt=0)
    status: AccountStatusEnum | None = None


class AccountMetricsUpdate(BaseModel):
    current_balance: Decimal | None = None
    current_equity: Decimal | None = None
    daily_pnl: Decimal | None = None
    total_drawdown_percent: Decimal | None = None
    daily_drawdown_percent: Decimal | None = None
    profit_percent: Decimal | None = None


class RiskEvaluationSchema(BaseModel):
    risk_status: RiskStatusEnum
    daily_loss_usage_percent: float | None = None
    drawdown_usage_percent: float | None = None
    remaining_daily_loss: Decimal | None = None
    remaining_drawdown: Decimal | None = None
    distance_to_profit_target: Decimal | None = None
    profit_target_percent: Decimal | None = None


class AccountResponse(BaseModel):
    id: str
    user_id: str
    account_name: str
    prop_firm_id: str | None
    prop_firm: str
    platform: PlatformEnum
    account_number: str
    starting_balance: Decimal
    daily_loss_limit: Decimal
    max_drawdown: Decimal
    status: AccountStatusEnum
    created_at: datetime
    current_balance: Decimal | None = None
    current_equity: Decimal | None = None
    daily_pnl: Decimal | None = None
    total_drawdown_percent: Decimal | None = None
    daily_drawdown_percent: Decimal | None = None
    profit_percent: Decimal | None = None
    last_updated: datetime | None = None
    risk_status: RiskStatusEnum = RiskStatusEnum.SAFE
    risk_evaluation: RiskEvaluationSchema | None = None
    prop_firm_rules: list[PropFirmRuleResponse] = []

    model_config = {"from_attributes": True}

    @field_validator("id", "user_id", "prop_firm_id", mode="before")
    @classmethod
    def serialize_uuid(cls, value: object) -> str | None:
        if value is None:
            return None
        return str(value)


class RiskSummary(BaseModel):
    safe: int = 0
    warning: int = 0
    danger: int = 0
    violated: int = 0


class AccountListResponse(BaseModel):
    accounts: list[AccountResponse]
    total: int
    active_count: int
    risk_summary: RiskSummary
