import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_current_active_user, get_db
from models.user import User
from schemas.account import (
    AccountCreate,
    AccountListResponse,
    AccountMetricsUpdate,
    AccountResponse,
    AccountUpdate,
)
from services import account_service
from services.monitoring_service import update_account_metrics

router = APIRouter()


def _account_or_404(db: Session, user: User, account_id: uuid.UUID):
    account = account_service.get_user_account(db, user.id, account_id)
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return account


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    payload: AccountCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> AccountResponse:
    account = account_service.create_account(db, current_user.id, payload)
    return account_service.account_to_response(account)


@router.get("", response_model=AccountListResponse)
def list_accounts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> AccountListResponse:
    accounts = account_service.list_user_accounts(db, current_user.id)
    data = account_service.build_account_list_response(accounts)
    return AccountListResponse(**data)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> AccountResponse:
    account = _account_or_404(db, current_user, account_id)
    return account_service.account_to_response(account)


@router.patch("/{account_id}/metrics", response_model=AccountResponse)
def update_metrics(
    account_id: uuid.UUID,
    payload: AccountMetricsUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> AccountResponse:
    account = _account_or_404(db, current_user, account_id)
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No metrics provided",
        )
    updated = update_account_metrics(db, current_user, account, payload)
    refreshed = account_service.get_user_account(db, current_user.id, updated.id)
    return account_service.account_to_response(refreshed or updated)


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: uuid.UUID,
    payload: AccountUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> AccountResponse:
    account = _account_or_404(db, current_user, account_id)
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    updated = account_service.update_account(db, account, payload)
    return account_service.account_to_response(updated)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> None:
    account = _account_or_404(db, current_user, account_id)
    account_service.delete_account(db, account)
