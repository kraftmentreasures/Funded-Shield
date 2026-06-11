"""Add prop firms, rules, and link accounts to prop firms

Revision ID: 004
Revises: 003
Create Date: 2026-05-31

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "prop_firms",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_prop_firms_name"), "prop_firms", ["name"], unique=True)

    op.create_table(
        "prop_firm_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("prop_firm_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rule_name", sa.String(length=150), nullable=False),
        sa.Column("rule_value", sa.String(length=255), nullable=False),
        sa.Column("rule_type", sa.String(length=20), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["prop_firm_id"], ["prop_firms.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_prop_firm_rules_prop_firm_id"),
        "prop_firm_rules",
        ["prop_firm_id"],
        unique=False,
    )

    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )

    op.add_column(
        "accounts",
        sa.Column("prop_firm_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_accounts_prop_firm_id",
        "accounts",
        "prop_firms",
        ["prop_firm_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_accounts_prop_firm_id"), "accounts", ["prop_firm_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_accounts_prop_firm_id"), table_name="accounts")
    op.drop_constraint("fk_accounts_prop_firm_id", "accounts", type_="foreignkey")
    op.drop_column("accounts", "prop_firm_id")
    op.drop_column("users", "is_admin")
    op.drop_index(op.f("ix_prop_firm_rules_prop_firm_id"), table_name="prop_firm_rules")
    op.drop_table("prop_firm_rules")
    op.drop_index(op.f("ix_prop_firms_name"), table_name="prop_firms")
    op.drop_table("prop_firms")
