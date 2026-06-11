import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from models.alert import AlertNotification, AlertSentKey
from models.trading_account import TradingAccount
from models.user import User
from risk_engine.evaluator import RiskEvaluationResult
from risk_engine.thresholds import RiskLevel
from services.telegram_service import TelegramError, send_telegram_message_sync


ALERT_THRESHOLDS: list[tuple[str, str, callable]] = []


def _severity_for_level(level: RiskLevel) -> str:
    if level == RiskLevel.VIOLATED:
        return "critical"
    if level == RiskLevel.DANGER:
        return "danger"
    if level == RiskLevel.WARNING:
        return "warning"
    return "info"


def _check_threshold_alerts(
    evaluation: RiskEvaluationResult,
) -> list[tuple[str, str, str]]:
    """Return list of (alert_type, severity, message_part)."""
    triggered: list[tuple[str, str, str]] = []

    if evaluation.daily_loss_usage_percent is not None:
        usage = evaluation.daily_loss_usage_percent
        if usage >= 100:
            triggered.append(
                (
                    "daily_loss_violated",
                    "critical",
                    f"Daily loss limit VIOLATED ({usage:.1f}% used)",
                )
            )
        elif usage >= 90:
            triggered.append(
                (
                    "daily_loss_90",
                    "danger",
                    f"Daily loss at {usage:.1f}% of limit (90% threshold)",
                )
            )
        elif usage >= 70:
            triggered.append(
                (
                    "daily_loss_70",
                    "warning",
                    f"Daily loss at {usage:.1f}% of limit (70% threshold)",
                )
            )

    if evaluation.drawdown_usage_percent is not None:
        usage = evaluation.drawdown_usage_percent
        if usage >= 100:
            triggered.append(
                (
                    "drawdown_violated",
                    "critical",
                    f"Max drawdown VIOLATED ({usage:.1f}% used)",
                )
            )
        elif usage >= 90:
            triggered.append(
                (
                    "drawdown_90",
                    "danger",
                    f"Drawdown at {usage:.1f}% of limit (90% threshold)",
                )
            )
        elif usage >= 70:
            triggered.append(
                (
                    "drawdown_70",
                    "warning",
                    f"Drawdown at {usage:.1f}% of limit (70% threshold)",
                )
            )

    if (
        evaluation.profit_target_percent is not None
        and evaluation.distance_to_profit_target is not None
        and evaluation.distance_to_profit_target <= 0
    ):
        triggered.append(
            (
                "profit_target_reached",
                "info",
                f"Profit target reached ({evaluation.profit_target_percent}%)",
            )
        )

    return triggered


def _already_sent(db: Session, account_id: uuid.UUID, alert_type: str) -> bool:
    return (
        db.query(AlertSentKey)
        .filter(
            AlertSentKey.account_id == account_id,
            AlertSentKey.alert_type == alert_type,
        )
        .first()
        is not None
    )


def _mark_sent(db: Session, account_id: uuid.UUID, alert_type: str) -> None:
    if not _already_sent(db, account_id, alert_type):
        db.add(AlertSentKey(account_id=account_id, alert_type=alert_type))
        db.flush()


def create_alert(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
    alert_type: str,
    severity: str,
    message: str,
    delivery_status: str = "sent",
) -> AlertNotification:
    alert = AlertNotification(
        user_id=user_id,
        account_id=account_id,
        alert_type=alert_type,
        severity=severity,
        message=message,
        status=delivery_status,
    )
    db.add(alert)
    db.flush()
    return alert


def process_alerts_for_account(
    db: Session,
    user: User,
    account: TradingAccount,
    evaluation: RiskEvaluationResult,
) -> list[AlertNotification]:
    created: list[AlertNotification] = []
    alerts = _check_threshold_alerts(evaluation)

    for alert_type, severity, detail in alerts:
        if _already_sent(db, account.id, alert_type):
            continue

        full_message = (
            f"<b>Funded-Shield Alert</b>\n"
            f"Account: {account.account_name} ({account.prop_firm})\n"
            f"Status: {evaluation.risk_status.value.upper()}\n"
            f"{detail}"
        )

        delivery = "sent"
        if user.telegram_alerts_enabled and user.telegram_bot_token and user.telegram_chat_id:
            try:
                send_telegram_message_sync(
                    user.telegram_bot_token,
                    user.telegram_chat_id,
                    full_message,
                )
            except TelegramError:
                delivery = "failed"

        alert = create_alert(
            db,
            user.id,
            account.id,
            alert_type,
            severity,
            full_message.replace("<b>", "").replace("</b>", ""),
            delivery_status=delivery,
        )
        _mark_sent(db, account.id, alert_type)
        created.append(alert)

    return created


def list_user_alerts(
    db: Session,
    user_id: uuid.UUID,
    *,
    account_id: uuid.UUID | None = None,
    severity: str | None = None,
    alert_type: str | None = None,
    status: str | None = None,
    limit: int = 100,
) -> list[AlertNotification]:
    query = db.query(AlertNotification).filter(AlertNotification.user_id == user_id)

    if account_id:
        query = query.filter(AlertNotification.account_id == account_id)
    if severity:
        query = query.filter(AlertNotification.severity == severity)
    if alert_type:
        query = query.filter(AlertNotification.alert_type == alert_type)
    if status:
        query = query.filter(AlertNotification.status == status)

    return (
        query.order_by(AlertNotification.created_at.desc()).limit(limit).all()
    )
