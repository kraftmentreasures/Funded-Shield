import uuid

from sqlalchemy.orm import Session, joinedload

from models.prop_firm import PropFirm
from models.trading_account import AccountStatus, Platform, TradingAccount
from risk_engine.evaluator import evaluate_account_risk
from schemas.account import (
    AccountCreate,
    AccountResponse,
    AccountUpdate,
    RiskEvaluationSchema,
    RiskStatusEnum,
)
from schemas.prop_firm import PropFirmRuleResponse
from services import prop_firm_service
from services.monitoring_service import get_dashboard_risk_summary


def get_user_account(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
) -> TradingAccount | None:
    return (
        db.query(TradingAccount)
        .options(joinedload(TradingAccount.prop_firm_ref).joinedload(PropFirm.rules))
        .filter(
            TradingAccount.id == account_id,
            TradingAccount.user_id == user_id,
        )
        .first()
    )


def list_user_accounts(db: Session, user_id: uuid.UUID) -> list[TradingAccount]:
    accounts = (
        db.query(TradingAccount)
        .options(joinedload(TradingAccount.prop_firm_ref).joinedload(PropFirm.rules))
        .filter(TradingAccount.user_id == user_id)
        .order_by(TradingAccount.created_at.desc())
        .all()
    )
    for account in accounts:
        evaluation = evaluate_account_risk(account)
        account.risk_status = evaluation.risk_status  # type: ignore[assignment]
    return accounts


def account_to_response(account: TradingAccount) -> AccountResponse:
    rules = []
    if account.prop_firm_ref and account.prop_firm_ref.rules:
        rules = [
            PropFirmRuleResponse.model_validate(r, from_attributes=True)
            for r in account.prop_firm_ref.rules
        ]

    evaluation = evaluate_account_risk(account)
    risk_eval = RiskEvaluationSchema(
        risk_status=RiskStatusEnum(evaluation.risk_status.value),
        daily_loss_usage_percent=evaluation.daily_loss_usage_percent,
        drawdown_usage_percent=evaluation.drawdown_usage_percent,
        remaining_daily_loss=evaluation.remaining_daily_loss,
        remaining_drawdown=evaluation.remaining_drawdown,
        distance_to_profit_target=evaluation.distance_to_profit_target,
        profit_target_percent=evaluation.profit_target_percent,
    )

    return AccountResponse(
        id=account.id,
        user_id=account.user_id,
        account_name=account.account_name,
        prop_firm_id=account.prop_firm_id,
        prop_firm=account.prop_firm,
        platform=account.platform.value,
        account_number=account.account_number,
        starting_balance=account.starting_balance,
        daily_loss_limit=account.daily_loss_limit,
        max_drawdown=account.max_drawdown,
        status=account.status.value,
        created_at=account.created_at,
        current_balance=account.current_balance,
        current_equity=account.current_equity,
        daily_pnl=account.daily_pnl,
        total_drawdown_percent=account.total_drawdown_percent,
        daily_drawdown_percent=account.daily_drawdown_percent,
        profit_percent=account.profit_percent,
        last_updated=account.last_updated,
        risk_status=RiskStatusEnum(evaluation.risk_status.value),
        risk_evaluation=risk_eval,
        prop_firm_rules=rules,
    )


def build_account_list_response(accounts: list[TradingAccount]) -> dict:
    responses = [account_to_response(a) for a in accounts]
    active_count = sum(1 for a in accounts if a.status == AccountStatus.ACTIVE)
    return {
        "accounts": responses,
        "total": len(accounts),
        "active_count": active_count,
        "risk_summary": get_dashboard_risk_summary(accounts),
    }


def create_account(
    db: Session,
    user_id: uuid.UUID,
    payload: AccountCreate,
) -> TradingAccount:
    prop_firm_id, prop_firm_name = prop_firm_service.resolve_prop_firm_for_account(
        db,
        payload.prop_firm_id,
        payload.prop_firm,
    )

    account = TradingAccount(
        user_id=user_id,
        account_name=payload.account_name,
        prop_firm_id=prop_firm_id,
        prop_firm=prop_firm_name,
        platform=Platform(payload.platform.value),
        account_number=payload.account_number,
        starting_balance=payload.starting_balance,
        daily_loss_limit=payload.daily_loss_limit,
        max_drawdown=payload.max_drawdown,
        status=AccountStatus(payload.status.value),
    )
    db.add(account)
    db.commit()
    return get_user_account(db, user_id, account.id)  # type: ignore[return-value]


def update_account(
    db: Session,
    account: TradingAccount,
    payload: AccountUpdate,
) -> TradingAccount:
    update_data = payload.model_dump(exclude_unset=True)

    if "platform" in update_data and update_data["platform"] is not None:
        update_data["platform"] = Platform(update_data["platform"].value)

    if "status" in update_data and update_data["status"] is not None:
        update_data["status"] = AccountStatus(update_data["status"].value)

    prop_firm_id = update_data.pop("prop_firm_id", None)
    prop_firm_name = update_data.pop("prop_firm", None)

    if prop_firm_id is not None or prop_firm_name is not None:
        resolved_id, resolved_name = prop_firm_service.resolve_prop_firm_for_account(
            db,
            prop_firm_id or account.prop_firm_id,
            prop_firm_name or account.prop_firm,
        )
        account.prop_firm_id = resolved_id
        account.prop_firm = resolved_name

    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    return get_user_account(db, account.user_id, account.id)  # type: ignore[return-value]


def delete_account(db: Session, account: TradingAccount) -> None:
    db.delete(account)
    db.commit()
