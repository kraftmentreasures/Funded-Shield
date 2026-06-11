export type RuleType = "percentage" | "amount" | "boolean" | "duration" | "text";

export interface PropFirm {
  id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  rule_count: number;
}

export interface PropFirmRule {
  id: string;
  prop_firm_id: string;
  rule_name: string;
  rule_value: string;
  rule_type: RuleType;
  source_url: string | null;
  verified: boolean;
  updated_at: string;
}

export interface PropFirmRuleWithFirm extends PropFirmRule {
  prop_firm_name: string;
}

export interface RuleListResponse {
  rules: PropFirmRuleWithFirm[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PropFirmFormData {
  name: string;
  website: string;
  logo_url: string;
  is_active: boolean;
}

export interface PropFirmDetail extends PropFirm {
  rules: PropFirmRule[];
}

export interface PropFirmListResponse {
  firms: PropFirm[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export const RULE_TYPE_OPTIONS: { value: RuleType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "percentage", label: "Percentage" },
  { value: "amount", label: "Amount" },
  { value: "boolean", label: "Boolean" },
  { value: "duration", label: "Duration" },
  { value: "text", label: "Text" },
];

export const VERIFIED_FILTER_OPTIONS = [
  { value: "", label: "All rules" },
  { value: "true", label: "Verified only" },
  { value: "false", label: "Unverified only" },
];
