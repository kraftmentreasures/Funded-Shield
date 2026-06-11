import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.prop_firm import PropFirm
    from models.user import User


class Platform(str, enum.Enum):
    MT4 = "MT4"
    MT5 = "MT5"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    BREACHED = "breached"


class RiskStatus(str, enum.Enum):
    SAFE = "safe"
    WARNING = "warning"
    DANGER = "danger"
    VIOLATED = "violated"


class TradingAccount(Base):
    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    account_name: Mapped[str] = mapped_column(String(100), nullable=False)
    prop_firm: Mapped[str] = mapped_column(String(100), nullable=False)
    prop_firm_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prop_firms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    platform: Mapped[Platform] = mapped_column(
        Enum(Platform, name="platform_enum", native_enum=False),
        nullable=False,
    )
    account_number: Mapped[str] = mapped_column(String(50), nullable=False)
    starting_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    daily_loss_limit: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    max_drawdown: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status_enum", native_enum=False),
        default=AccountStatus.ACTIVE,
        nullable=False,
    )
    current_balance: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    current_equity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    daily_pnl: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    total_drawdown_percent: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 4), nullable=True
    )
    daily_drawdown_percent: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 4), nullable=True
    )
    profit_percent: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    last_updated: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    risk_status: Mapped[RiskStatus] = mapped_column(
        Enum(RiskStatus, name="risk_status_enum", native_enum=False),
        default=RiskStatus.SAFE,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="trading_accounts")
    prop_firm_ref: Mapped["PropFirm | None"] = relationship(
        "PropFirm",
        back_populates="trading_accounts",
    )
