import { ApiRequestError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AccountMetricsUpdate, TradingAccount } from "@/types/account";

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

export async function updateAccountMetrics(
  accountId: string,
  metrics: AccountMetricsUpdate,
): Promise<TradingAccount> {
  return apiFetch<TradingAccount>(`/api/v1/accounts/${accountId}/metrics`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(metrics),
  });
}
