import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.deps import get_db
from core.pagination import total_pages
from models.prop_firm_rule import RuleType
from schemas.prop_firm import (
    PropFirmRuleResponse,
    PropFirmRuleWithFirmResponse,
    RuleListResponse,
)
from services import prop_firm_service

router = APIRouter()


@router.get("", response_model=RuleListResponse)
def list_rules(
    db: Annotated[Session, Depends(get_db)],
    prop_firm_id: uuid.UUID | None = Query(None, description="Filter by prop firm ID"),
    firm_search: str | None = Query(None, description="Search by prop firm name"),
    search: str | None = Query(None, description="Search rule name or value"),
    rule_type: str | None = Query(None, description="Filter by rule type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
) -> RuleListResponse:
    rule_type_enum = None
    if rule_type:
        try:
            rule_type_enum = RuleType(rule_type)
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid rule_type. Use: {[t.value for t in RuleType]}",
            ) from exc

    rows, page, page_size, total = prop_firm_service.list_all_rules(
        db,
        prop_firm_id=prop_firm_id,
        search=search,
        rule_type=rule_type_enum,
        firm_search=firm_search,
        page=page,
        page_size=page_size,
    )

    rules: list[PropFirmRuleWithFirmResponse] = []
    for rule, firm_name in rows:
        base = PropFirmRuleResponse.model_validate(rule, from_attributes=True)
        rules.append(
            PropFirmRuleWithFirmResponse(
                **base.model_dump(),
                prop_firm_name=firm_name,
            )
        )

    return RuleListResponse(
        rules=rules,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages(total, page_size),
    )
