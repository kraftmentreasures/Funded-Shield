import enum


class RiskLevel(str, enum.Enum):
    SAFE = "safe"
    WARNING = "warning"
    DANGER = "danger"
    VIOLATED = "violated"


_LEVEL_ORDER = {
    RiskLevel.SAFE: 0,
    RiskLevel.WARNING: 1,
    RiskLevel.DANGER: 2,
    RiskLevel.VIOLATED: 3,
}


def usage_to_risk_level(usage_percent: float) -> RiskLevel:
    if usage_percent >= 100:
        return RiskLevel.VIOLATED
    if usage_percent >= 90:
        return RiskLevel.DANGER
    if usage_percent >= 70:
        return RiskLevel.WARNING
    return RiskLevel.SAFE


def worst_level(*levels: RiskLevel) -> RiskLevel:
    if not levels:
        return RiskLevel.SAFE
    return max(levels, key=lambda level: _LEVEL_ORDER[level])
