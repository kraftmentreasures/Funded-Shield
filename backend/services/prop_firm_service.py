import uuid

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from core.pagination import normalize_pagination

from models.prop_firm import PropFirm
from models.prop_firm_rule import PropFirmRule, RuleType
from schemas.prop_firm import (
    PropFirmCreate,
    PropFirmRuleCreate,
    PropFirmRuleUpdate,
    PropFirmUpdate,
)


def get_prop_firm(db: Session, firm_id: uuid.UUID) -> PropFirm | None:
    return (
        db.query(PropFirm)
        .options(joinedload(PropFirm.rules))
        .filter(PropFirm.id == firm_id)
        .first()
    )


def get_prop_firm_by_name(db: Session, name: str) -> PropFirm | None:
    return (
        db.query(PropFirm)
        .options(joinedload(PropFirm.rules))
        .filter(PropFirm.name.ilike(name.strip()))
        .first()
    )


def _prop_firms_base_query(
    db: Session,
    *,
    search: str | None = None,
    active_only: bool = True,
):
    query = db.query(PropFirm)

    if active_only:
        query = query.filter(PropFirm.is_active.is_(True))

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PropFirm.name.ilike(term),
                PropFirm.website.ilike(term),
            )
        )

    return query


def _attach_rule_counts(
    db: Session,
    firms: list[PropFirm],
) -> list[tuple[PropFirm, int]]:
    if not firms:
        return []

    firm_ids = [f.id for f in firms]
    counts = dict(
        db.query(PropFirmRule.prop_firm_id, func.count(PropFirmRule.id))
        .filter(PropFirmRule.prop_firm_id.in_(firm_ids))
        .group_by(PropFirmRule.prop_firm_id)
        .all()
    )
    return [(firm, int(counts.get(firm.id, 0))) for firm in firms]


def list_prop_firms(
    db: Session,
    *,
    search: str | None = None,
    active_only: bool = True,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[tuple[PropFirm, int]], int, int, int]:
    page, page_size, offset = normalize_pagination(page, page_size)
    query = _prop_firms_base_query(db, search=search, active_only=active_only)

    total = query.count()
    firms = (
        query.order_by(PropFirm.name).offset(offset).limit(page_size).all()
    )
    firms_with_counts = _attach_rule_counts(db, firms)
    return firms_with_counts, page, page_size, total


def list_prop_firms_all(
    db: Session,
    *,
    search: str | None = None,
    active_only: bool = True,
) -> list[PropFirm]:
    """Unpaginated list — use only for small sets (e.g. account form search)."""
    query = _prop_firms_base_query(db, search=search, active_only=active_only)
    return query.order_by(PropFirm.name).limit(50).all()


def create_prop_firm(db: Session, payload: PropFirmCreate) -> PropFirm:
    firm = PropFirm(**payload.model_dump())
    db.add(firm)
    db.commit()
    db.refresh(firm)
    return firm


def update_prop_firm(
    db: Session,
    firm: PropFirm,
    payload: PropFirmUpdate,
) -> PropFirm:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(firm, field, value)
    db.commit()
    db.refresh(firm)
    return firm


def delete_prop_firm(db: Session, firm: PropFirm) -> None:
    db.delete(firm)
    db.commit()


def get_rule(db: Session, rule_id: uuid.UUID) -> PropFirmRule | None:
    return db.query(PropFirmRule).filter(PropFirmRule.id == rule_id).first()


def list_rules_for_firm(
    db: Session,
    firm_id: uuid.UUID,
    *,
    search: str | None = None,
    rule_type: RuleType | None = None,
    verified_only: bool | None = None,
) -> list[PropFirmRule]:
    query = db.query(PropFirmRule).filter(PropFirmRule.prop_firm_id == firm_id)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PropFirmRule.rule_name.ilike(term),
                PropFirmRule.rule_value.ilike(term),
            )
        )

    if rule_type is not None:
        query = query.filter(PropFirmRule.rule_type == rule_type)

    if verified_only is not None:
        query = query.filter(PropFirmRule.verified.is_(verified_only))

    return query.order_by(PropFirmRule.rule_name).all()


def create_rule(
    db: Session,
    firm_id: uuid.UUID,
    payload: PropFirmRuleCreate,
) -> PropFirmRule:
    rule = PropFirmRule(
        prop_firm_id=firm_id,
        rule_name=payload.rule_name,
        rule_value=payload.rule_value,
        rule_type=RuleType(payload.rule_type.value),
        source_url=payload.source_url,
        verified=payload.verified,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def update_rule(
    db: Session,
    rule: PropFirmRule,
    payload: PropFirmRuleUpdate,
) -> PropFirmRule:
    update_data = payload.model_dump(exclude_unset=True)
    if "rule_type" in update_data and update_data["rule_type"] is not None:
        update_data["rule_type"] = RuleType(update_data["rule_type"].value)

    for field, value in update_data.items():
        setattr(rule, field, value)

    db.commit()
    db.refresh(rule)
    return rule


def delete_rule(db: Session, rule: PropFirmRule) -> None:
    db.delete(rule)
    db.commit()


def firm_to_response(firm: PropFirm, rule_count: int | None = None) -> "PropFirmResponse":
    from schemas.prop_firm import PropFirmResponse

    if rule_count is None:
        rule_count = len(firm.rules) if firm.rules else 0

    return PropFirmResponse(
        id=str(firm.id),
        name=firm.name,
        website=firm.website,
        logo_url=firm.logo_url,
        is_active=firm.is_active,
        created_at=firm.created_at,
        rule_count=rule_count,
    )


def _rules_base_query(
    db: Session,
    *,
    prop_firm_id: uuid.UUID | None = None,
    search: str | None = None,
    rule_type: RuleType | None = None,
    firm_search: str | None = None,
):
    query = db.query(PropFirmRule, PropFirm.name).join(
        PropFirm, PropFirmRule.prop_firm_id == PropFirm.id
    )

    if prop_firm_id is not None:
        query = query.filter(PropFirmRule.prop_firm_id == prop_firm_id)

    if firm_search:
        term = f"%{firm_search.strip()}%"
        query = query.filter(PropFirm.name.ilike(term))

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PropFirmRule.rule_name.ilike(term),
                PropFirmRule.rule_value.ilike(term),
            )
        )

    if rule_type is not None:
        query = query.filter(PropFirmRule.rule_type == rule_type)

    return query.filter(PropFirm.is_active.is_(True))


def list_all_rules(
    db: Session,
    *,
    prop_firm_id: uuid.UUID | None = None,
    search: str | None = None,
    rule_type: RuleType | None = None,
    firm_search: str | None = None,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[tuple[PropFirmRule, str]], int, int, int]:
    page, page_size, offset = normalize_pagination(page, page_size, max_page_size=100)
    query = _rules_base_query(
        db,
        prop_firm_id=prop_firm_id,
        search=search,
        rule_type=rule_type,
        firm_search=firm_search,
    )

    total = query.count()
    rows = (
        query.order_by(PropFirm.name, PropFirmRule.rule_name)
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return [(rule, firm_name) for rule, firm_name in rows], page, page_size, total


def resolve_prop_firm_for_account(
    db: Session,
    prop_firm_id: uuid.UUID | None,
    prop_firm_name: str,
) -> tuple[uuid.UUID | None, str]:
    if prop_firm_id:
        firm = get_prop_firm(db, prop_firm_id)
        if firm:
            return firm.id, firm.name
    firm = get_prop_firm_by_name(db, prop_firm_name)
    if firm:
        return firm.id, firm.name
    return None, prop_firm_name
