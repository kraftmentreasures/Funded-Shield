import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from models.trading_account import RiskStatus, TradingAccount
from models.user import User
from risk_engine.evaluator import evaluate_account_risk
from risk_engine.thresholds import RiskLevel
from schemas.account import AccountMetricsUpdate, RiskSummary
from services import alert_service


def update_account_metrics(
    db: Session,
    user: User,
    account: TradingAccount,
    payload: AccountMetricsUpdate,
) -> TradingAccount:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(account, field, value)

    account.last_updated = datetime.now(UTC)

    evaluation = evaluate_account_risk(account)
    account.risk_status = RiskStatus(evaluation.risk_status.value)

    db.commit()
    db.refresh(account)

    alert_service.process_alerts_for_account(db, user, account, evaluation)
    db.commit()

    return account


def evaluate_and_refresh_account(db: Session, account: TradingAccount) -> TradingAccount:
    evaluation = evaluate_account_risk(account)
    account.risk_status = RiskStatus(evaluation.risk_status.value)
    db.commit()
    db.refresh(account)
    return account


def get_dashboard_risk_summary(accounts: list[TradingAccount]) -> RiskSummary:
    counts = {"safe": 0, "warning": 0, "danger": 0, "violated": 0}
    for account in accounts:
        evaluation = evaluate_account_risk(account)
        key = evaluation.risk_status.value
        if key in counts:
            counts[key] += 1
        else:
            counts["safe"] += 1

    return RiskSummary(
        safe=counts["safe"],
        warning=counts["warning"],
        danger=counts["danger"],
        violated=counts["violated"],
    )


def risk_level_counts(db: Session, user_id: uuid.UUID) -> dict[str, int]:
    accounts = (
        db.query(TradingAccount)
        .filter(TradingAccount.user_id == user_id)
        .all()
    )
    summary = get_dashboard_risk_summary(accounts)
    return {
        "safe": summary.safe,
        "warning": summary.warning,
        "danger": summary.danger,
        "violated": summary.violated,
    }
