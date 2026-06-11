import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { PropFirm, PropFirmFormData } from "@/types/propFirm";

function adminHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export async function adminCreatePropFirm(data: PropFirmFormData): Promise<PropFirm> {
  return apiFetch<PropFirm>("/api/v1/admin/prop-firms", {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      name: data.name,
      website: data.website || null,
      logo_url: data.logo_url || null,
      is_active: data.is_active,
    }),
  });
}

export async function adminUpdatePropFirm(
  id: string,
  data: Partial<PropFirmFormData>,
): Promise<PropFirm> {
  return apiFetch<PropFirm>(`/api/v1/admin/prop-firms/${id}`, {
    method: "PUT",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      name: data.name,
      website: data.website || null,
      logo_url: data.logo_url || null,
      is_active: data.is_active,
    }),
  });
}

export async function adminDeletePropFirm(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/prop-firms/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}
