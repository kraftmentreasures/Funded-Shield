from pydantic import BaseModel, Field


class TelegramSettingsUpdate(BaseModel):
    telegram_bot_token: str | None = Field(None, max_length=255)
    telegram_chat_id: str | None = Field(None, max_length=100)
    telegram_alerts_enabled: bool | None = None


class TelegramSettingsResponse(BaseModel):
    telegram_bot_token_set: bool = False
    telegram_chat_id: str | None = None
    telegram_alerts_enabled: bool = False


class TelegramTestResponse(BaseModel):
    success: bool
    message: str
