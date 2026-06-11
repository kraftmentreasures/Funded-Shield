import { apiFetch } from "@/lib/api";
import type { RuleListResponse, RuleType } from "@/types/propFirm";

export async function listRules(filters?: {
  prop_firm_id?: string;
  firm_search?: string;
  search?: string;
  rule_type?: RuleType | "";
  page?: number;
  page_size?: number;
}): Promise<RuleListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters?.page ?? 1));
  params.set("page_size", String(filters?.page_size ?? 50));
  if (filters?.prop_firm_id) {
    params.set("prop_firm_id", filters.prop_firm_id);
  }
  if (filters?.firm_search?.trim()) {
    params.set("firm_search", filters.firm_search.trim());
  }
  if (filters?.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters?.rule_type) {
    params.set("rule_type", filters.rule_type);
  }
  return apiFetch<RuleListResponse>(`/api/v1/rules?${params.toString()}`);
}
