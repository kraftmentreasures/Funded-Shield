import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AlertFilters, AlertListResponse } from "@/types/alert";

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function listAlerts(filters: AlertFilters = {}): Promise<AlertListResponse> {
  const params = new URLSearchParams();
  if (filters.account_id) params.set("account_id", filters.account_id);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.alert_type) params.set("alert_type", filters.alert_type);
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  const path = `/api/v1/alerts${query ? `?${query}` : ""}`;

  return apiFetch<AlertListResponse>(path, {
    headers: authHeaders(),
  });
}
