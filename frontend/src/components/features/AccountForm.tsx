"use client";

import { FormEvent, useEffect, useState } from "react";

import { ApiRequestError } from "@/lib/api";
import { searchPropFirms } from "@/lib/propFirms";
import type { AccountFormData, TradingAccount } from "@/types/account";
import { PLATFORM_OPTIONS, STATUS_OPTIONS } from "@/types/account";
import type { PropFirm } from "@/types/propFirm";

interface AccountFormProps {
  initial?: TradingAccount | null;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const emptyForm: AccountFormData = {
  account_name: "",
  prop_firm_id: "",
  prop_firm: "",
  platform: "MT5",
  account_number: "",
  starting_balance: "",
  daily_loss_limit: "",
  max_drawdown: "",
  status: "active",
};

export function AccountForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: AccountFormProps) {
  const [form, setForm] = useState<AccountFormData>(emptyForm);
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [firmSearch, setFirmSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPropFirms(firmSearch)
        .then(setPropFirms)
        .catch(() => setPropFirms([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [firmSearch]);

  useEffect(() => {
    if (initial) {
      setForm({
        account_name: initial.account_name,
        prop_firm_id: initial.prop_firm_id ?? "",
        prop_firm: initial.prop_firm,
        platform: initial.platform,
        account_number: initial.account_number,
        starting_balance: initial.starting_balance,
        daily_loss_limit: initial.daily_loss_limit,
        max_drawdown: initial.max_drawdown,
        status: initial.status,
      });
    } else if (propFirms.length > 0) {
      setForm((prev) => ({
        ...prev,
        prop_firm_id: propFirms[0].id,
        prop_firm: propFirms[0].name,
      }));
    }
  }, [initial, propFirms]);

  function handlePropFirmChange(firmId: string) {
    const firm = propFirms.find((f) => f.id === firmId);
    if (firm) {
      setForm((prev) => ({
        ...prev,
        prop_firm_id: firm.id,
        prop_firm: firm.name,
      }));
    }
  }

  function updateField<K extends keyof AccountFormData>(
    key: K,
    value: AccountFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to save account");
      }
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-slate-300">Account name</label>
          <input
            required
            value={form.account_name}
            onChange={(e) => updateField("account_name", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
            placeholder="FTMO 100K Challenge"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-slate-300">Prop firm</label>
          <input
            type="search"
            placeholder="Search prop firms..."
            value={firmSearch}
            onChange={(e) => setFirmSearch(e.target.value)}
            className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none"
          />
          <select
            required
            value={form.prop_firm_id}
            onChange={(e) => handlePropFirmChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          >
            <option value="" disabled>
              Select a prop firm
            </option>
            {propFirms.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Search supports 1000+ firms. Rules apply automatically on your dashboard.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Platform</label>
          <select
            required
            value={form.platform}
            onChange={(e) => updateField("platform", e.target.value as AccountFormData["platform"])}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Account number</label>
          <input
            required
            value={form.account_number}
            onChange={(e) => updateField("account_number", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
            placeholder="12345678"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Status</label>
          <select
            required
            value={form.status}
            onChange={(e) => updateField("status", e.target.value as AccountFormData["status"])}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Starting balance ($)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.starting_balance}
            onChange={(e) => updateField("starting_balance", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Daily loss limit ($)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.daily_loss_limit}
            onChange={(e) => updateField("daily_loss_limit", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-slate-300">Max drawdown ($)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.max_drawdown}
            onChange={(e) => updateField("max_drawdown", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !form.prop_firm_id}
          className="rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-500 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
