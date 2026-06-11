import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.prop_firm_rule import PropFirmRule
    from models.trading_account import TradingAccount


class PropFirm(Base):
    __tablename__ = "prop_firms"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    rules: Mapped[list["PropFirmRule"]] = relationship(
        "PropFirmRule",
        back_populates="prop_firm",
        cascade="all, delete-orphan",
    )
    trading_accounts: Mapped[list["TradingAccount"]] = relationship(
        "TradingAccount",
        back_populates="prop_firm_ref",
    )
