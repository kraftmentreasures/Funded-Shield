"use client";

import { FormEvent, useEffect, useState } from "react";

import { ApiRequestError } from "@/lib/api";
import type { PropFirm, PropFirmFormData } from "@/types/propFirm";

interface PropFirmAdminFormProps {
  initial?: PropFirm | null;
  onSubmit: (data: PropFirmFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const emptyForm: PropFirmFormData = {
  name: "",
  website: "",
  logo_url: "",
  is_active: true,
};

export function PropFirmAdminForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: PropFirmAdminFormProps) {
  const [form, setForm] = useState<PropFirmFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        website: initial.website ?? "",
        logo_url: initial.logo_url ?? "",
        is_active: initial.is_active,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

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
        setError("Failed to save prop firm.");
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

      <div>
        <label className="mb-1 block text-sm text-slate-300">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          placeholder="https://example.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Logo URL</label>
        <input
          type="url"
          value={form.logo_url}
          onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
          placeholder="https://example.com/logo.png"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
          className="rounded border-slate-700"
        />
        Active (visible to users)
      </label>

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
          disabled={loading}
          className="rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-500 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
