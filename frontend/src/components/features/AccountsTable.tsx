"use client";

import { RiskBadge } from "@/components/features/RiskBadge";
import type { TradingAccount } from "@/types/account";
import { STATUS_OPTIONS } from "@/types/account";

interface AccountsTableProps {
  accounts: TradingAccount[];
  onEdit: (account: TradingAccount) => void;
  onDelete: (account: TradingAccount) => void;
  onUpdateMetrics?: (account: TradingAccount) => void;
  deletingId: string | null;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

function statusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-950 text-green-300 border-green-800";
    case "breached":
      return "bg-red-950 text-red-300 border-red-800";
    case "paused":
      return "bg-yellow-950 text-yellow-300 border-yellow-800";
    default:
      return "bg-slate-800 text-slate-400 border-slate-700";
  }
}

export function AccountsTable({
  accounts,
  onEdit,
  onDelete,
  onUpdateMetrics,
  deletingId,
}: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
        <p className="text-slate-400">No trading accounts yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Click &quot;Add Account&quot; to connect your first prop firm account.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-900/80">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-400">Account</th>
            <th className="px-4 py-3 font-medium text-slate-400">Prop firm</th>
            <th className="px-4 py-3 font-medium text-slate-400">Platform</th>
            <th className="px-4 py-3 font-medium text-slate-400">Number</th>
            <th className="px-4 py-3 font-medium text-slate-400">Balance</th>
            <th className="px-4 py-3 font-medium text-slate-400">Rule status</th>
            <th className="px-4 py-3 font-medium text-slate-400">Status</th>
            <th className="px-4 py-3 font-medium text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-slate-900/50">
              <td className="px-4 py-3 font-medium text-white">
                {account.account_name}
              </td>
              <td className="px-4 py-3 text-slate-300">{account.prop_firm}</td>
              <td className="px-4 py-3 text-slate-300">{account.platform}</td>
              <td className="px-4 py-3 text-slate-400">{account.account_number}</td>
              <td className="px-4 py-3 text-slate-300">
                {formatCurrency(account.current_balance ?? account.starting_balance)}
              </td>
              <td className="px-4 py-3">
                <RiskBadge status={account.risk_status} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(account.status)}`}
                >
                  {statusLabel(account.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {onUpdateMetrics && (
                    <button
                      type="button"
                      onClick={() => onUpdateMetrics(account)}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-shield-400 hover:border-shield-500 hover:text-white"
                    >
                      Metrics
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(account)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-shield-500 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(account)}
                    disabled={deletingId === account.id}
                    className="rounded-lg border border-red-900 px-3 py-1 text-xs text-red-400 hover:border-red-700 hover:text-red-300 disabled:opacity-50"
                  >
                    {deletingId === account.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
