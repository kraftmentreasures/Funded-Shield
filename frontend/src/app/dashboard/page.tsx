"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AccountRiskCard } from "@/components/features/AccountRiskCard";
import { DashboardNav } from "@/components/features/DashboardNav";
import { MetricsUpdateForm } from "@/components/features/MetricsUpdateForm";
import { RiskSummaryWidgets } from "@/components/features/RiskSummaryWidgets";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import { listAccounts } from "@/lib/accounts";
import type { RiskSummary, TradingAccount } from "@/types/account";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [metricsAccount, setMetricsAccount] = useState<TradingAccount | null>(null);

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    setError("");
    try {
      const data = await listAccounts();
      setAccounts(data.accounts);
      setTotal(data.total);
      setActiveCount(data.active_count);
      setRiskSummary(data.risk_summary);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadAccounts();
  }, [user, loadAccounts]);

  function handleMetricsSuccess(updated: TradingAccount) {
    setMetricsAccount(null);
    setSuccess(`Metrics updated for ${updated.account_name}. Risk: ${updated.risk_status}.`);
    loadAccounts();
  }

  if (authLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardNav user={user} onLogout={logout} />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
        <p className="mb-8 text-slate-400">
          Welcome back, {user.name}. Monitor funded account risk and prop firm rules in real time.
        </p>

        {success && <Alert variant="success" message={success} />}
        {error && <Alert variant="error" message={error} />}

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            Risk overview
          </h2>
          <RiskSummaryWidgets summary={riskSummary} loading={accountsLoading} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total accounts</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {accountsLoading ? "—" : total}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Active accounts</p>
            <p className="mt-2 text-3xl font-bold text-shield-500">
              {accountsLoading ? "—" : activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Prop firms linked</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {accountsLoading
                ? "—"
                : new Set(accounts.map((a) => a.prop_firm)).size}
            </p>
          </div>
        </div>

        {accountsLoading ? (
          <p className="text-sm text-slate-400">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">No trading accounts yet.</p>
            <Link
              href="/accounts"
              className="mt-2 inline-block text-shield-500 hover:underline"
            >
              Add your first account
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {accounts.map((account) => (
              <AccountRiskCard
                key={account.id}
                account={account}
                onUpdateMetrics={setMetricsAccount}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <p className="text-sm text-slate-400">
              Manage accounts, view alert history, or configure Telegram notifications.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/accounts"
              className="rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-500"
            >
              My Accounts
            </Link>
            <Link
              href="/alerts"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Alert Center
            </Link>
            <Link
              href="/settings"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Telegram settings
            </Link>
          </div>
        </div>

        {metricsAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-bold text-white">Update account metrics</h2>
              <MetricsUpdateForm
                account={metricsAccount}
                onSuccess={handleMetricsSuccess}
                onCancel={() => setMetricsAccount(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
