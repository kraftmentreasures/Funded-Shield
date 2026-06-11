from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_current_active_user, get_db
from models.user import User
from schemas.settings import (
    TelegramSettingsResponse,
    TelegramSettingsUpdate,
    TelegramTestResponse,
)
from services.telegram_service import TelegramError, send_telegram_message_sync

router = APIRouter()


def _settings_response(user: User) -> TelegramSettingsResponse:
    return TelegramSettingsResponse(
        telegram_bot_token_set=bool(user.telegram_bot_token),
        telegram_chat_id=user.telegram_chat_id,
        telegram_alerts_enabled=user.telegram_alerts_enabled,
    )


@router.get("/telegram", response_model=TelegramSettingsResponse)
def get_telegram_settings(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> TelegramSettingsResponse:
    return _settings_response(current_user)


@router.put("/telegram", response_model=TelegramSettingsResponse)
def update_telegram_settings(
    payload: TelegramSettingsUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> TelegramSettingsResponse:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings to update",
        )

    for field, value in data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return _settings_response(current_user)


@router.post("/telegram/test", response_model=TelegramTestResponse)
def test_telegram_connection(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> TelegramTestResponse:
    if not current_user.telegram_bot_token or not current_user.telegram_chat_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Telegram bot token and chat ID are required",
        )

    try:
        send_telegram_message_sync(
            current_user.telegram_bot_token,
            current_user.telegram_chat_id,
            "<b>Funded-Shield</b>\n✅ Telegram connection successful! You will receive risk alerts here.",
        )
    except TelegramError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return TelegramTestResponse(
        success=True,
        message="Test message sent successfully.",
    )
