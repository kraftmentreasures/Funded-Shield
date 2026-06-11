"""Account metrics, risk status, telegram settings, alert history

Revision ID: 005
Revises: 004
Create Date: 2026-05-31

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "accounts",
        sa.Column("current_balance", sa.Numeric(18, 2), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("current_equity", sa.Numeric(18, 2), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("daily_pnl", sa.Numeric(18, 2), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("total_drawdown_percent", sa.Numeric(8, 4), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("daily_drawdown_percent", sa.Numeric(8, 4), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("profit_percent", sa.Numeric(8, 4), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "accounts",
        sa.Column(
            "risk_status",
            sa.String(length=20),
            nullable=False,
            server_default="safe",
        ),
    )

    op.add_column(
        "users",
        sa.Column("telegram_bot_token", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("telegram_chat_id", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "telegram_alerts_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.create_table(
        "alert_notifications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("account_id", sa.UUID(), nullable=False),
        sa.Column("alert_type", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="sent",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_alert_notifications_user_id"),
        "alert_notifications",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_alert_notifications_account_id"),
        "alert_notifications",
        ["account_id"],
        unique=False,
    )

    op.create_table(
        "alert_sent_keys",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("account_id", sa.UUID(), nullable=False),
        sa.Column("alert_type", sa.String(length=50), nullable=False),
        sa.Column(
            "sent_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "alert_type", name="uq_alert_sent_account_type"),
    )


def downgrade() -> None:
    op.drop_table("alert_sent_keys")
    op.drop_index(op.f("ix_alert_notifications_account_id"), table_name="alert_notifications")
    op.drop_index(op.f("ix_alert_notifications_user_id"), table_name="alert_notifications")
    op.drop_table("alert_notifications")
    op.drop_column("users", "telegram_alerts_enabled")
    op.drop_column("users", "telegram_chat_id")
    op.drop_column("users", "telegram_bot_token")
    op.drop_column("accounts", "risk_status")
    op.drop_column("accounts", "last_updated")
    op.drop_column("accounts", "profit_percent")
    op.drop_column("accounts", "daily_drawdown_percent")
    op.drop_column("accounts", "total_drawdown_percent")
    op.drop_column("accounts", "daily_pnl")
    op.drop_column("accounts", "current_equity")
    op.drop_column("accounts", "current_balance")
