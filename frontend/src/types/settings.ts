export interface TelegramSettings {
  telegram_bot_token_set: boolean;
  telegram_chat_id: string | null;
  telegram_alerts_enabled: boolean;
}

export interface TelegramSettingsUpdate {
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  telegram_alerts_enabled?: boolean;
}

export interface TelegramTestResponse {
  success: boolean;
  message: string;
}
