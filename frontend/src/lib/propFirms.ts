import { apiFetch } from "@/lib/api";
import type {
  PropFirm,
  PropFirmDetail,
  PropFirmListResponse,
  RuleType,
} from "@/types/propFirm";

export interface ListPropFirmsOptions {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listPropFirms(
  searchOrOptions?: string | ListPropFirmsOptions,
  activeOnly = true,
  page = 1,
  pageSize = 20,
): Promise<PropFirmListResponse> {
  let search: string | undefined;
  let active = activeOnly;
  let p = page;
  let size = pageSize;

  if (typeof searchOrOptions === "object") {
    search = searchOrOptions.search;
    active = searchOrOptions.activeOnly ?? true;
    p = searchOrOptions.page ?? 1;
    size = searchOrOptions.pageSize ?? 20;
  } else {
    search = searchOrOptions;
  }

  const params = new URLSearchParams();
  params.set("active_only", String(active));
  params.set("page", String(p));
  params.set("page_size", String(size));
  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch<PropFirmListResponse>(`/api/v1/prop-firms?${params.toString()}`);
}

/** Search prop firms for dropdowns (max 50 results). */
export async function searchPropFirms(query: string): Promise<PropFirm[]> {
  const data = await listPropFirms({
    search: query,
    activeOnly: true,
    page: 1,
    pageSize: 50,
  });
  return data.firms;
}

export async function getPropFirm(
  id: string,
  filters?: {
    search?: string;
    rule_type?: RuleType | "";
    verified_only?: boolean | null;
  },
): Promise<PropFirmDetail> {
  const params = new URLSearchParams();
  if (filters?.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters?.rule_type) {
    params.set("rule_type", filters.rule_type);
  }
  if (filters?.verified_only !== undefined && filters?.verified_only !== null) {
    params.set("verified_only", String(filters.verified_only));
  }
  const query = params.toString();
  return apiFetch<PropFirmDetail>(
    `/api/v1/prop-firms/${id}${query ? `?${query}` : ""}`,
  );
}
