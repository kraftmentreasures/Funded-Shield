"use client";

import { useState } from "react";

import { ApiRequestError } from "@/lib/api";
import { updateAccountMetrics } from "@/lib/monitoring";
import type { AccountMetricsUpdate, TradingAccount } from "@/types/account";

interface MetricsUpdateFormProps {
  account: TradingAccount;
  onSuccess: (account: TradingAccount) => void;
  onCancel: () => void;
}

function toInput(value: string | null | undefined): string {
  return value ?? "";
}

export function MetricsUpdateForm({
  account,
  onSuccess,
  onCancel,
}: MetricsUpdateFormProps) {
  const [currentBalance, setCurrentBalance] = useState(
    toInput(account.current_balance),
  );
  const [currentEquity, setCurrentEquity] = useState(
    toInput(account.current_equity),
  );
  const [dailyPnl, setDailyPnl] = useState(toInput(account.daily_pnl));
  const [totalDrawdown, setTotalDrawdown] = useState(
    toInput(account.total_drawdown_percent),
  );
  const [dailyDrawdown, setDailyDrawdown] = useState(
    toInput(account.daily_drawdown_percent),
  );
  const [profitPercent, setProfitPercent] = useState(
    toInput(account.profit_percent),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: AccountMetricsUpdate = {};
    if (currentBalance !== "") payload.current_balance = currentBalance;
    if (currentEquity !== "") payload.current_equity = currentEquity;
    if (dailyPnl !== "") payload.daily_pnl = dailyPnl;
    if (totalDrawdown !== "") payload.total_drawdown_percent = totalDrawdown;
    if (dailyDrawdown !== "") payload.daily_drawdown_percent = dailyDrawdown;
    if (profitPercent !== "") payload.profit_percent = profitPercent;

    if (Object.keys(payload).length === 0) {
      setError("Enter at least one metric.");
      setLoading(false);
      return;
    }

    try {
      const updated = await updateAccountMetrics(account.id, payload);
      onSuccess(updated);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to update metrics.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-400">
        Updating metrics for <span className="text-white">{account.account_name}</span>.
        Risk status and alerts are recalculated automatically.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="current_balance" className="mb-1 block text-sm text-slate-300">
            Current balance
          </label>
          <input
            id="current_balance"
            type="number"
            step="0.01"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            className={inputClass}
            placeholder="100000"
          />
        </div>
        <div>
          <label htmlFor="current_equity" className="mb-1 block text-sm text-slate-300">
            Current equity
          </label>
          <input
            id="current_equity"
            type="number"
            step="0.01"
            value={currentEquity}
            onChange={(e) => setCurrentEquity(e.target.value)}
            className={inputClass}
            placeholder="99850"
          />
        </div>
        <div>
          <label htmlFor="daily_pnl" className="mb-1 block text-sm text-slate-300">
            Daily P/L
          </label>
          <input
            id="daily_pnl"
            type="number"
            step="0.01"
            value={dailyPnl}
            onChange={(e) => setDailyPnl(e.target.value)}
            className={inputClass}
            placeholder="-500"
          />
        </div>
        <div>
          <label
            htmlFor="total_drawdown_percent"
            className="mb-1 block text-sm text-slate-300"
          >
            Total drawdown %
          </label>
          <input
            id="total_drawdown_percent"
            type="number"
            step="0.01"
            value={totalDrawdown}
            onChange={(e) => setTotalDrawdown(e.target.value)}
            className={inputClass}
            placeholder="3.5"
          />
        </div>
        <div>
          <label
            htmlFor="daily_drawdown_percent"
            className="mb-1 block text-sm text-slate-300"
          >
            Daily drawdown %
          </label>
          <input
            id="daily_drawdown_percent"
            type="number"
            step="0.01"
            value={dailyDrawdown}
            onChange={(e) => setDailyDrawdown(e.target.value)}
            className={inputClass}
            placeholder="2.1"
          />
        </div>
        <div>
          <label htmlFor="profit_percent" className="mb-1 block text-sm text-slate-300">
            Profit %
          </label>
          <input
            id="profit_percent"
            type="number"
            step="0.01"
            value={profitPercent}
            onChange={(e) => setProfitPercent(e.target.value)}
            className={inputClass}
            placeholder="4.2"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-500 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save & evaluate risk"}
        </button>
      </div>
    </form>
  );
}
