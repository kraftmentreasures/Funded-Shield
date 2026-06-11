"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/lib/api";
import { searchPropFirms } from "@/lib/propFirms";
import { listRules } from "@/lib/rules";
import type { PropFirm, PropFirmRuleWithFirm, RuleType } from "@/types/propFirm";
import { RULE_TYPE_OPTIONS } from "@/types/propFirm";

const PAGE_SIZE = 50;

function ruleTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function RulesPage() {
  const [rules, setRules] = useState<PropFirmRuleWithFirm[]>([]);
  const [firmOptions, setFirmOptions] = useState<PropFirm[]>([]);
  const [firmId, setFirmId] = useState("");
  const [firmSearch, setFirmSearch] = useState("");
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleType, setRuleType] = useState<RuleType | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPropFirms(firmSearch).then(setFirmOptions).catch(() => setFirmOptions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [firmSearch]);

  useEffect(() => {
    setPage(1);
  }, [firmId, firmSearch, ruleSearch, ruleType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listRules({
        prop_firm_id: firmId || undefined,
        firm_search: firmId ? undefined : firmSearch || undefined,
        search: ruleSearch,
        rule_type: ruleType,
        page,
        page_size: PAGE_SIZE,
      })
        .then((data) => {
          setRules(data.rules);
          setTotal(data.total);
          setTotalPages(data.total_pages);
          setError("");
        })
        .catch((err) => {
          if (err instanceof ApiRequestError) {
            setError(err.message);
          } else {
            setError("Failed to load rules.");
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [firmId, firmSearch, ruleSearch, ruleType, page]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Prop Firm Rules</h1>
          <p className="mt-2 text-slate-400">
            {total > 0
              ? `${total.toLocaleString()} rules across all firms. `
              : ""}
            Filter by firm or rule type.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={firmId}
            onChange={(e) => {
              setFirmId(e.target.value);
              if (e.target.value) setFirmSearch("");
            }}
            className="max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-shield-500 focus:outline-none"
          >
            <option value="">All prop firms</option>
            {firmOptions.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.name}
              </option>
            ))}
          </select>

          {!firmId && (
            <input
              type="search"
              placeholder="Search prop firm name..."
              value={firmSearch}
              onChange={(e) => setFirmSearch(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none"
            />
          )}

          <input
            type="search"
            placeholder="Search rules..."
            value={ruleSearch}
            onChange={(e) => setRuleSearch(e.target.value)}
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
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <LoadingScreen message="Loading rules..." />
        ) : rules.length === 0 ? (
          <p className="text-slate-400">No rules match your filters.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-400">Prop firm</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Rule</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Value</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Type</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/prop-firms/${rule.prop_firm_id}`}
                          className="font-medium text-shield-500 hover:underline"
                        >
                          {rule.prop_firm_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white">{rule.rule_name}</td>
                      <td className="px-4 py-3 text-slate-300">{rule.rule_value}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {ruleTypeLabel(rule.rule_type)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${
                            rule.verified ? "text-green-400" : "text-slate-500"
                          }`}
                        >
                          {rule.verified ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="rules"
            />
          </>
        )}
      </main>
    </div>
  );
}
