import type { RiskSummary } from "@/types/account";

interface RiskSummaryWidgetsProps {
  summary: RiskSummary | null;
  loading?: boolean;
}

const WIDGETS = [
  { key: "safe" as const, label: "Accounts safe", color: "text-green-400 border-green-900" },
  { key: "warning" as const, label: "Warning", color: "text-yellow-400 border-yellow-900" },
  { key: "danger" as const, label: "Danger", color: "text-orange-400 border-orange-900" },
  { key: "violated" as const, label: "Violated", color: "text-red-400 border-red-900" },
];

export function RiskSummaryWidgets({ summary, loading }: RiskSummaryWidgetsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {WIDGETS.map(({ key, label, color }) => (
        <div
          key={key}
          className={`rounded-xl border bg-slate-900 p-5 ${color.split(" ")[1] ?? "border-slate-800"}`}
        >
          <p className="text-sm text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${color.split(" ")[0]}`}>
            {loading || !summary ? "—" : summary[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
