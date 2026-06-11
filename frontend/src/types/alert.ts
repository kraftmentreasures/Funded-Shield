export type AlertSeverity = "info" | "warning" | "danger" | "critical";

export interface AlertNotification {
  id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  alert_type: string;
  severity: AlertSeverity;
  message: string;
  status: string;
  created_at: string;
}

export interface AlertListResponse {
  alerts: AlertNotification[];
  total: number;
}

export interface AlertFilters {
  account_id?: string;
  severity?: string;
  alert_type?: string;
  status?: string;
  limit?: number;
}

export const ALERT_TYPE_LABELS: Record<string, string> = {
  daily_loss_70: "Daily Loss 70%",
  daily_loss_90: "Daily Loss 90%",
  daily_loss_violated: "Daily Loss Violated",
  drawdown_70: "Drawdown 70%",
  drawdown_90: "Drawdown 90%",
  drawdown_violated: "Drawdown Violated",
  profit_target_reached: "Profit Target Reached",
};

export const SEVERITY_OPTIONS = [
  { value: "", label: "All severities" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
  { value: "critical", label: "Critical" },
];
