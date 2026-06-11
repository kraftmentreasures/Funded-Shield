from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from api.deps import get_current_active_user, get_db, user_is_admin
from models.user import User
from schemas.auth import Token, UserRegister, UserResponse
from services.auth_service import AuthError, authenticate_user, create_user_token, register_user

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {"description": "Email already registered"},
        422: {"description": "Validation error"},
    },
)
def register(payload: UserRegister, db: Annotated[Session, Depends(get_db)]) -> UserResponse:
    try:
        user = register_user(db, payload)
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            is_active=user.is_active,
            is_admin=False,
        )
    except AuthError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post(
    "/login",
    response_model=Token,
    responses={
        401: {"description": "Invalid credentials"},
        403: {"description": "Inactive account"},
    },
)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
    except AuthError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
            headers={"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None,
        ) from exc

    access_token = create_user_token(user)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserResponse:
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
        is_admin=user_is_admin(current_user),
    )
