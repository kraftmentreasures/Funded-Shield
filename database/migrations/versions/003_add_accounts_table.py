"""Add trading accounts table

Revision ID: 003
Revises: 002
Create Date: 2026-05-31

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("account_name", sa.String(length=100), nullable=False),
        sa.Column("prop_firm", sa.String(length=100), nullable=False),
        sa.Column("platform", sa.String(length=10), nullable=False),
        sa.Column("account_number", sa.String(length=50), nullable=False),
        sa.Column("starting_balance", sa.Numeric(18, 2), nullable=False),
        sa.Column("daily_loss_limit", sa.Numeric(18, 2), nullable=False),
        sa.Column("max_drawdown", sa.Numeric(18, 2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_accounts_user_id"), "accounts", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_accounts_user_id"), table_name="accounts")
    op.drop_table("accounts")
