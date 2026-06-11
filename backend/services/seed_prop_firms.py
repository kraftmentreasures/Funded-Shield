"""Seed prop firms and rules for Funded-Shield."""

from sqlalchemy.orm import Session

from models.prop_firm import PropFirm
from models.prop_firm_rule import PropFirmRule, RuleType

SEED_FIRMS: list[dict] = [
    {
        "name": "FTMO",
        "website": "https://ftmo.com",
        "logo_url": None,
        "rules": [
            ("Daily Loss Limit", "5", RuleType.PERCENTAGE, "https://ftmo.com/en/faq/"),
            ("Max Loss (Drawdown)", "10", RuleType.PERCENTAGE, "https://ftmo.com/en/faq/"),
            ("Profit Target Phase 1", "10", RuleType.PERCENTAGE, "https://ftmo.com/en/faq/"),
            ("Profit Target Phase 2", "5", RuleType.PERCENTAGE, "https://ftmo.com/en/faq/"),
            ("Minimum Trading Days", "4", RuleType.DURATION, "https://ftmo.com/en/faq/"),
            ("News Trading Allowed", "false", RuleType.BOOLEAN, "https://ftmo.com/en/faq/"),
            ("Weekend Holding", "false", RuleType.BOOLEAN, "https://ftmo.com/en/faq/"),
        ],
    },
    {
        "name": "FundedNext",
        "website": "https://fundednext.com",
        "logo_url": None,
        "rules": [
            ("Daily Loss Limit", "5", RuleType.PERCENTAGE, "https://fundednext.com/"),
            ("Max Trailing Drawdown", "10", RuleType.PERCENTAGE, "https://fundednext.com/"),
            ("Profit Target (Stellar)", "8", RuleType.PERCENTAGE, "https://fundednext.com/"),
            ("Minimum Trading Days", "5", RuleType.DURATION, "https://fundednext.com/"),
            ("News Trading", "restricted", RuleType.TEXT, "https://fundednext.com/"),
            ("Max Lot Size", "varies", RuleType.TEXT, "https://fundednext.com/"),
        ],
    },
    {
        "name": "The Funded Trader",
        "website": "https://thefundedtraderprogram.com",
        "logo_url": None,
        "rules": [
            ("Daily Drawdown", "5", RuleType.PERCENTAGE, "https://thefundedtraderprogram.com/"),
            ("Max Drawdown", "10", RuleType.PERCENTAGE, "https://thefundedtraderprogram.com/"),
            ("Profit Target", "10", RuleType.PERCENTAGE, "https://thefundedtraderprogram.com/"),
            ("Minimum Trading Days", "3", RuleType.DURATION, "https://thefundedtraderprogram.com/"),
            ("Inactivity Limit", "30 days", RuleType.TEXT, "https://thefundedtraderprogram.com/"),
        ],
    },
    {
        "name": "E8 Markets",
        "website": "https://e8markets.com",
        "logo_url": None,
        "rules": [
            ("Daily Loss Limit", "5", RuleType.PERCENTAGE, "https://e8markets.com/"),
            ("Max Drawdown", "8", RuleType.PERCENTAGE, "https://e8markets.com/"),
            ("Profit Target", "8", RuleType.PERCENTAGE, "https://e8markets.com/"),
            ("Minimum Trading Days", "5", RuleType.DURATION, "https://e8markets.com/"),
            ("Consistency Rule", "true", RuleType.BOOLEAN, "https://e8markets.com/"),
        ],
    },
    {
        "name": "Blue Guardian",
        "website": "https://blueguardian.com",
        "logo_url": None,
        "rules": [
            ("Daily Loss Limit", "4", RuleType.PERCENTAGE, "https://blueguardian.com/"),
            ("Max Drawdown", "10", RuleType.PERCENTAGE, "https://blueguardian.com/"),
            ("Profit Target", "10", RuleType.PERCENTAGE, "https://blueguardian.com/"),
            ("Minimum Trading Days", "5", RuleType.DURATION, "https://blueguardian.com/"),
            ("Leverage (Forex)", "1:100", RuleType.TEXT, "https://blueguardian.com/"),
        ],
    },
]


def seed_prop_firms(db: Session) -> None:
    existing = db.query(PropFirm).count()
    if existing > 0:
        return

    for firm_data in SEED_FIRMS:
        rules_data = firm_data["rules"]
        firm = PropFirm(
            name=firm_data["name"],
            website=firm_data["website"],
            logo_url=firm_data["logo_url"],
            is_active=True,
        )
        db.add(firm)
        db.flush()

        for rule_name, rule_value, rule_type, source_url in rules_data:
            db.add(
                PropFirmRule(
                    prop_firm_id=firm.id,
                    rule_name=rule_name,
                    rule_value=rule_value,
                    rule_type=rule_type,
                    source_url=source_url,
                    verified=True,
                )
            )

    db.commit()
