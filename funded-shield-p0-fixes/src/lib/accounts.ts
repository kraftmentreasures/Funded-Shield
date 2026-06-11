import { ApiRequestError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type {
  AccountFormData,
  AccountListResponse,
  TradingAccount,
} from "@/types/account";

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new ApiRequestError(
      "Your session has expired. Please sign in again.",
      401,
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export async function listAccounts(): Promise<AccountListResponse> {
  return apiFetch<AccountListResponse>("/api/v1/accounts", {
    headers: authHeaders(),
  });
}

export async function getAccount(id: string): Promise<TradingAccount> {
  return apiFetch<TradingAccount>(`/api/v1/accounts/${id}`, {
    headers: authHeaders(),
  });
}

export async function createAccount(data: AccountFormData): Promise<TradingAccount> {
  return apiFetch<TradingAccount>("/api/v1/accounts", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
}

export async function updateAccount(
  id: string,
  data: Partial<AccountFormData>,
): Promise<TradingAccount> {
  return apiFetch<TradingAccount>(`/api/v1/accounts/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/accounts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
