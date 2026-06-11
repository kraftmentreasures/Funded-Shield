"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PropFirmRulesTable } from "@/components/features/PropFirmRulesTable";
import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ApiRequestError } from "@/lib/api";
import { getPropFirm } from "@/lib/propFirms";
import type { PropFirmDetail, RuleType } from "@/types/propFirm";
import { RULE_TYPE_OPTIONS, VERIFIED_FILTER_OPTIONS } from "@/types/propFirm";

export default function PropFirmDetailPage() {
  const params = useParams();
  const firmId = params.id as string;

  const [firm, setFirm] = useState<PropFirmDetail | null>(null);
  const [search, setSearch] = useState("");
  const [ruleType, setRuleType] = useState<RuleType | "">("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const verifiedOnly =
        verifiedFilter === "true"
          ? true
          : verifiedFilter === "false"
            ? false
            : null;

      getPropFirm(firmId, {
        search,
        rule_type: ruleType,
        verified_only: verifiedOnly,
      })
        .then(setFirm)
        .catch((err) => {
          if (err instanceof ApiRequestError) {
            setError(err.message);
          } else {
            setError("Failed to load prop firm.");
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [firmId, search, ruleType, verifiedFilter]);

  if (loading && !firm) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <LoadingScreen message="Loading prop firm..." />
      </div>
    );
  }

  if (error || !firm) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-red-400">{error || "Prop firm not found."}</p>
          <Link href="/prop-firms" className="mt-4 inline-block text-shield-500 hover:underline">
            ← Back to prop firms
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/prop-firms" className="text-sm text-shield-500 hover:underline">
          ← All prop firms
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-white">{firm.name}</h1>
          {firm.website && (
            <a
              href={firm.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-slate-400 hover:text-shield-500"
            >
              {firm.website}
            </a>
          )}
          <p className="mt-2 text-sm text-slate-500">
            {firm.rules.length} rule{firm.rules.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="search"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none"
          />
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value as RuleType | "")}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-shield-500 focus:outline-none"
          >
            {RULE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-shield-500 focus:outline-none"
          >
            {VERIFIED_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Updating rules...</p>
        ) : (
          <PropFirmRulesTable rules={firm.rules} />
        )}
      </main>
    </div>
  );
}
