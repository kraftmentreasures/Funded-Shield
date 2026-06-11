"use client";

import Link from "next/link";

import { RiskBadge } from "@/components/features/RiskBadge";
import { PropFirmRulesTable } from "@/components/features/PropFirmRulesTable";
import type { TradingAccount } from "@/types/account";

interface AccountRiskCardProps {
  account: TradingAccount;
  onUpdateMetrics?: (account: TradingAccount) => void;
}

function formatCurrency(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatPercent(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  return `${Number(value).toFixed(2)}%`;
}

function formatPnl(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "always",
  }).format(num);
  return (
    <span className={num >= 0 ? "text-green-400" : "text-red-400"}>{formatted}</span>
  );
}

export function AccountRiskCard({ account, onUpdateMetrics }: AccountRiskCardProps) {
  const eval_ = account.risk_evaluation;
  const drawdownPct =
    account.total_drawdown_percent ?? account.daily_drawdown_percent;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{account.account_name}</h2>
            <RiskBadge status={account.risk_status} />
          </div>
          <p className="mt-1 text-shield-500">{account.prop_firm}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{account.platform}</span>
            <span>·</span>
            <span
              className={
                account.status === "active" ? "text-green-400" : "text-slate-400"
              }
            >
              {account.status}
            </span>
            {account.last_updated && (
              <>
                <span>·</span>
                <span>
                  Updated {new Date(account.last_updated).toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onUpdateMetrics && (
            <button
              type="button"
              onClick={() => onUpdateMetrics(account)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-shield-500 hover:text-white"
            >
              Update metrics
            </button>
          )}
          {account.prop_firm_id && (
            <Link
              href={`/prop-firms/${account.prop_firm_id}`}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-shield-500 hover:border-shield-500"
            >
              Firm details →
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">Current balance</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(account.current_balance)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">Current equity</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(account.current_equity)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">Daily P/L</p>
          <p className="mt-1 text-lg font-semibold">{formatPnl(account.daily_pnl)}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">Drawdown %</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatPercent(drawdownPct)}
          </p>
        </div>
      </div>

      {eval_ && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {eval_.remaining_daily_loss != null && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Remaining daily loss</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatCurrency(eval_.remaining_daily_loss)}
              </p>
              {eval_.daily_loss_usage_percent != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {eval_.daily_loss_usage_percent.toFixed(1)}% of limit used
                </p>
              )}
            </div>
          )}
          {eval_.remaining_drawdown != null && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Remaining drawdown</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatCurrency(eval_.remaining_drawdown)}
              </p>
              {eval_.drawdown_usage_percent != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {eval_.drawdown_usage_percent.toFixed(1)}% of limit used
                </p>
              )}
            </div>
          )}
          {eval_.distance_to_profit_target != null && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Distance to profit target</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatPercent(eval_.distance_to_profit_target)}
              </p>
            </div>
          )}
        </div>
      )}

      {account.prop_firm_rules.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-400">
            Prop firm rules ({account.prop_firm_rules.length})
          </h3>
          <PropFirmRulesTable rules={account.prop_firm_rules} compact />
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Link a prop firm to enable automatic rule monitoring.
        </p>
      )}
    </section>
  );
}
