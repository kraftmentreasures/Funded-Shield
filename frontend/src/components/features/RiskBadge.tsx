import type { RiskStatus } from "@/types/account";
import { RISK_STATUS_LABELS } from "@/types/account";

const BADGE_STYLES: Record<RiskStatus, string> = {
  safe: "bg-green-950 text-green-300 border-green-700",
  warning: "bg-yellow-950 text-yellow-300 border-yellow-700",
  danger: "bg-orange-950 text-orange-300 border-orange-700",
  violated: "bg-red-950 text-red-300 border-red-700",
};

interface RiskBadgeProps {
  status: RiskStatus;
  className?: string;
}

export function RiskBadge({ status, className = "" }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${BADGE_STYLES[status]} ${className}`}
    >
      {RISK_STATUS_LABELS[status]}
    </span>
  );
}
