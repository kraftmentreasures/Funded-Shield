from dataclasses import dataclass
from decimal import Decimal

from models.prop_firm_rule import PropFirmRule, RuleType
from models.trading_account import TradingAccount
from risk_engine.thresholds import RiskLevel, usage_to_risk_level, worst_level


@dataclass
class RuleLimits:
    daily_loss_limit_pct: Decimal | None = None
    max_drawdown_pct: Decimal | None = None
    profit_target_pct: Decimal | None = None


@dataclass
class RiskEvaluationResult:
    risk_status: RiskLevel
    daily_loss_usage_percent: float | None
    drawdown_usage_percent: float | None
    remaining_daily_loss: Decimal | None
    remaining_drawdown: Decimal | None
    distance_to_profit_target: Decimal | None
    profit_target_percent: Decimal | None


def _parse_rule_limits(rules: list[PropFirmRule]) -> RuleLimits:
    limits = RuleLimits()
    for rule in rules:
        name = rule.rule_name.lower()
        if rule.rule_type != RuleType.PERCENTAGE:
            continue
        try:
            value = Decimal(rule.rule_value)
        except Exception:
            continue

        if "daily loss" in name:
            limits.daily_loss_limit_pct = value
        elif "drawdown" in name or "max loss" in name:
            if limits.max_drawdown_pct is None or value > limits.max_drawdown_pct:
                limits.max_drawdown_pct = value
        elif "profit target" in name or "profit" in name and "target" in name:
            limits.profit_target_pct = value
    return limits


def _decimal_or_zero(value: Decimal | None) -> Decimal:
    return value if value is not None else Decimal("0")


def evaluate_account_risk(account: TradingAccount) -> RiskEvaluationResult:
    rules = account.prop_firm_ref.rules if account.prop_firm_ref else []
    limits = _parse_rule_limits(rules)

    starting = account.starting_balance
    levels: list[RiskLevel] = []

    daily_loss_usage: float | None = None
    remaining_daily_loss: Decimal | None = None
    drawdown_usage: float | None = None
    remaining_drawdown: Decimal | None = None
    distance_to_profit: Decimal | None = None
    profit_target_pct = limits.profit_target_pct

    daily_pnl = _decimal_or_zero(account.daily_pnl)
    daily_loss_amount = abs(min(daily_pnl, Decimal("0")))

    if limits.daily_loss_limit_pct and limits.daily_loss_limit_pct > 0:
        max_daily_loss = starting * (limits.daily_loss_limit_pct / Decimal("100"))
        if max_daily_loss > 0:
            daily_loss_usage = float((daily_loss_amount / max_daily_loss) * 100)
            remaining_daily_loss = max_daily_loss - daily_loss_amount
            levels.append(usage_to_risk_level(daily_loss_usage))
    elif account.daily_loss_limit and account.daily_loss_limit > 0:
        daily_loss_usage = float((daily_loss_amount / account.daily_loss_limit) * 100)
        remaining_daily_loss = account.daily_loss_limit - daily_loss_amount
        levels.append(usage_to_risk_level(daily_loss_usage))

    dd_pct = account.total_drawdown_percent or account.daily_drawdown_percent
    if dd_pct is not None and limits.max_drawdown_pct and limits.max_drawdown_pct > 0:
        drawdown_usage = float(
            (Decimal(str(dd_pct)) / limits.max_drawdown_pct) * 100
        )
        max_dd_amount = starting * (limits.max_drawdown_pct / Decimal("100"))
        current_dd = starting * (Decimal(str(dd_pct)) / Decimal("100"))
        remaining_drawdown = max_dd_amount - current_dd
        levels.append(usage_to_risk_level(drawdown_usage))
    elif account.max_drawdown and account.max_drawdown > 0 and dd_pct is not None:
        max_dd_amount = account.max_drawdown
        current_dd = starting * (Decimal(str(dd_pct)) / Decimal("100"))
        drawdown_usage = float((current_dd / max_dd_amount) * 100)
        remaining_drawdown = max_dd_amount - current_dd
        levels.append(usage_to_risk_level(drawdown_usage))

    if profit_target_pct and account.profit_percent is not None:
        profit_dec = Decimal(str(account.profit_percent))
        distance_to_profit = profit_target_pct - profit_dec

    overall = worst_level(*levels) if levels else RiskLevel.SAFE

    return RiskEvaluationResult(
        risk_status=overall,
        daily_loss_usage_percent=daily_loss_usage,
        drawdown_usage_percent=drawdown_usage,
        remaining_daily_loss=remaining_daily_loss,
        remaining_drawdown=remaining_drawdown,
        distance_to_profit_target=distance_to_profit,
        profit_target_percent=profit_target_pct,
    )
