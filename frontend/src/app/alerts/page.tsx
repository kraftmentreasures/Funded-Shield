"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardNav } from "@/components/features/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import { listAccounts } from "@/lib/accounts";
import { listAlerts } from "@/lib/alerts";
import type { TradingAccount } from "@/types/account";
import {
  ALERT_TYPE_LABELS,
  SEVERITY_OPTIONS,
  type AlertNotification,
} from "@/types/alert";

function severityBadgeClass(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-950 text-red-300 border-red-800";
    case "danger":
      return "bg-orange-950 text-orange-300 border-orange-800";
    case "warning":
      return "bg-yellow-950 text-yellow-300 border-yellow-800";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}

function formatAlertType(type: string) {
  return ALERT_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export default function AlertsPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [accountFilter, setAccountFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [alertData, accountData] = await Promise.all([
        listAlerts({
          account_id: accountFilter || undefined,
          severity: severityFilter || undefined,
          status: statusFilter || undefined,
          limit: 200,
        }),
        listAccounts(),
      ]);
      setAlerts(alertData.alerts);
      setAccounts(accountData.accounts);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to load alerts.");
      }
    } finally {
      setLoading(false);
    }
  }, [accountFilter, severityFilter, statusFilter]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return null;
  }

  const selectClass =
    "rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-shield-500 focus:outline-none";

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardNav user={user} onLogout={logout} />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Alert Center</h1>
        <p className="mb-8 text-slate-400">
          History of risk alerts across your funded accounts.
        </p>

        {error && <Alert variant="error" message={error} />}

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="filter-account" className="mb-1 block text-xs text-slate-500">
              Account
            </label>
            <select
              id="filter-account"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-severity" className="mb-1 block text-xs text-slate-500">
              Severity
            </label>
            <select
              id="filter-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className={selectClass}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-1 block text-xs text-slate-500">
              Status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">All statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingScreen message="Loading alerts..." />
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400">No alerts yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Alerts appear when account metrics cross risk thresholds. Update metrics on the
              dashboard to trigger monitoring.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-400">Alert type</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Account</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Severity</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">
                        {formatAlertType(alert.alert_type)}
                      </p>
                      <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                        {alert.message}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{alert.account_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${severityBadgeClass(alert.severity)}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          alert.status === "sent"
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
