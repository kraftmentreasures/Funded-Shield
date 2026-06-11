import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_current_admin_user, get_db
from models.prop_firm import PropFirm
from models.prop_firm_rule import PropFirmRule
from models.user import User
from schemas.prop_firm import (
    PropFirmCreate,
    PropFirmResponse,
    PropFirmRuleCreate,
    PropFirmRuleResponse,
    PropFirmRuleUpdate,
    PropFirmUpdate,
)
from services import prop_firm_service

router = APIRouter()


def _firm_or_404(db: Session, firm_id: uuid.UUID) -> PropFirm:
    firm = prop_firm_service.get_prop_firm(db, firm_id)
    if firm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prop firm not found")
    return firm


def _rule_or_404(db: Session, rule_id: uuid.UUID) -> PropFirmRule:
    rule = prop_firm_service.get_rule(db, rule_id)
    if rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return rule


@router.post("/prop-firms", response_model=PropFirmResponse, status_code=status.HTTP_201_CREATED)
def admin_create_prop_firm(
    payload: PropFirmCreate,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> PropFirmResponse:
    existing = prop_firm_service.get_prop_firm_by_name(db, payload.name)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Prop firm already exists")
    firm = prop_firm_service.create_prop_firm(db, payload)
    return prop_firm_service.firm_to_response(firm, rule_count=0)


@router.put("/prop-firms/{firm_id}", response_model=PropFirmResponse)
def admin_update_prop_firm(
    firm_id: uuid.UUID,
    payload: PropFirmUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> PropFirmResponse:
    firm = _firm_or_404(db, firm_id)
    updated = prop_firm_service.update_prop_firm(db, firm, payload)
    refreshed = prop_firm_service.get_prop_firm(db, updated.id)
    return prop_firm_service.firm_to_response(refreshed or updated)


@router.delete("/prop-firms/{firm_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_prop_firm(
    firm_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> None:
    firm = _firm_or_404(db, firm_id)
    prop_firm_service.delete_prop_firm(db, firm)


@router.post(
    "/prop-firms/{firm_id}/rules",
    response_model=PropFirmRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_rule(
    firm_id: uuid.UUID,
    payload: PropFirmRuleCreate,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> PropFirmRule:
    _firm_or_404(db, firm_id)
    return prop_firm_service.create_rule(db, firm_id, payload)


@router.put("/rules/{rule_id}", response_model=PropFirmRuleResponse)
def admin_update_rule(
    rule_id: uuid.UUID,
    payload: PropFirmRuleUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> PropFirmRule:
    rule = _rule_or_404(db, rule_id)
    return prop_firm_service.update_rule(db, rule, payload)


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_rule(
    rule_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(get_current_admin_user)],
) -> None:
    rule = _rule_or_404(db, rule_id)
    prop_firm_service.delete_rule(db, rule)
