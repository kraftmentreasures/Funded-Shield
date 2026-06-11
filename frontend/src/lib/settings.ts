import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type {
  TelegramSettings,
  TelegramSettingsUpdate,
  TelegramTestResponse,
} from "@/types/settings";

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
  return apiFetch<TelegramSettings>("/api/v1/settings/telegram", {
    headers: authHeaders(),
  });
}

export async function updateTelegramSettings(
  data: TelegramSettingsUpdate,
): Promise<TelegramSettings> {
  return apiFetch<TelegramSettings>("/api/v1/settings/telegram", {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
}

export async function testTelegramConnection(): Promise<TelegramTestResponse> {
  return apiFetch<TelegramTestResponse>("/api/v1/settings/telegram/test", {
    method: "POST",
    headers: authHeaders(),
  });
}
