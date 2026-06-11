import type { PropFirmRule } from "@/types/propFirm";

export type Platform = "MT4" | "MT5";

export type AccountStatus = "active" | "inactive" | "paused" | "breached";

export type RiskStatus = "safe" | "warning" | "danger" | "violated";

export interface RiskEvaluation {
  risk_status: RiskStatus;
  daily_loss_usage_percent: number | null;
  drawdown_usage_percent: number | null;
  remaining_daily_loss: string | null;
  remaining_drawdown: string | null;
  distance_to_profit_target: string | null;
  profit_target_percent: string | null;
}

export interface TradingAccount {
  id: string;
  user_id: string;
  account_name: string;
  prop_firm_id: string | null;
  prop_firm: string;
  platform: Platform;
  account_number: string;
  starting_balance: string;
  daily_loss_limit: string;
  max_drawdown: string;
  status: AccountStatus;
  created_at: string;
  current_balance: string | null;
  current_equity: string | null;
  daily_pnl: string | null;
  total_drawdown_percent: string | null;
  daily_drawdown_percent: string | null;
  profit_percent: string | null;
  last_updated: string | null;
  risk_status: RiskStatus;
  risk_evaluation: RiskEvaluation | null;
  prop_firm_rules: PropFirmRule[];
}

export interface RiskSummary {
  safe: number;
  warning: number;
  danger: number;
  violated: number;
}

export interface AccountListResponse {
  accounts: TradingAccount[];
  total: number;
  active_count: number;
  risk_summary: RiskSummary;
}

export interface AccountFormData {
  account_name: string;
  prop_firm_id: string;
  prop_firm: string;
  platform: Platform;
  account_number: string;
  starting_balance: string;
  daily_loss_limit: string;
  max_drawdown: string;
  status: AccountStatus;
}

export interface AccountMetricsUpdate {
  current_balance?: string;
  current_equity?: string;
  daily_pnl?: string;
  total_drawdown_percent?: string;
  daily_drawdown_percent?: string;
  profit_percent?: string;
}

export const PLATFORM_OPTIONS: Platform[] = ["MT4", "MT5"];

export const STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "paused", label: "Paused" },
  { value: "breached", label: "Breached" },
];

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  safe: "Safe",
  warning: "Warning",
  danger: "Danger",
  violated: "Violated",
};
