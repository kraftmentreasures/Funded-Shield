import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.deps import get_db
from core.pagination import total_pages
from models.prop_firm_rule import RuleType
from schemas.prop_firm import (
    PropFirmDetailResponse,
    PropFirmListResponse,
    PropFirmResponse,
    PropFirmRuleResponse,
)
from services import prop_firm_service

router = APIRouter()


@router.get("", response_model=PropFirmListResponse)
def list_prop_firms(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(None, description="Search by name or website"),
    active_only: bool = Query(True, description="Only return active firms"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
) -> PropFirmListResponse:
    firms_with_counts, page, page_size, total = prop_firm_service.list_prop_firms(
        db,
        search=search,
        active_only=active_only,
        page=page,
        page_size=page_size,
    )
    return PropFirmListResponse(
        firms=[
            prop_firm_service.firm_to_response(firm, rule_count=count)
            for firm, count in firms_with_counts
        ],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages(total, page_size),
    )


@router.get("/{firm_id}", response_model=PropFirmDetailResponse)
def get_prop_firm(
    firm_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(None, description="Filter rules by name or value"),
    rule_type: str | None = Query(None, description="Filter by rule type"),
    verified_only: bool | None = Query(None, description="Filter by verified status"),
) -> PropFirmDetailResponse:
    firm = prop_firm_service.get_prop_firm(db, firm_id)
    if firm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prop firm not found")

    rule_type_enum = None
    if rule_type:
        try:
            rule_type_enum = RuleType(rule_type)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid rule_type. Use: {[t.value for t in RuleType]}",
            ) from exc

    rules = prop_firm_service.list_rules_for_firm(
        db,
        firm_id,
        search=search,
        rule_type=rule_type_enum,
        verified_only=verified_only,
    )

    return PropFirmDetailResponse(
        id=str(firm.id),
        name=firm.name,
        website=firm.website,
        logo_url=firm.logo_url,
        is_active=firm.is_active,
        created_at=firm.created_at,
        rule_count=len(rules),
        rules=[PropFirmRuleResponse.model_validate(r, from_attributes=True) for r in rules],
    )
