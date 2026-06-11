"use client";

import type { PropFirmRule, RuleType } from "@/types/propFirm";

interface PropFirmRulesTableProps {
  rules: PropFirmRule[];
  compact?: boolean;
}

function ruleTypeLabel(type: RuleType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function PropFirmRulesTable({ rules, compact = false }: PropFirmRulesTableProps) {
  if (rules.length === 0) {
    return (
      <p className="text-sm text-slate-400">No rules found for the current filters.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className={`w-full text-left text-sm ${compact ? "" : "min-w-[700px]"}`}>
        <thead className="border-b border-slate-800 bg-slate-900/80">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-400">Rule</th>
            <th className="px-4 py-3 font-medium text-slate-400">Value</th>
            <th className="px-4 py-3 font-medium text-slate-400">Type</th>
            {!compact && (
              <>
                <th className="px-4 py-3 font-medium text-slate-400">Verified</th>
                <th className="px-4 py-3 font-medium text-slate-400">Source</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-slate-900/50">
              <td className="px-4 py-3 font-medium text-white">{rule.rule_name}</td>
              <td className="px-4 py-3 text-shield-400">{rule.rule_value}</td>
              <td className="px-4 py-3 text-slate-400">{ruleTypeLabel(rule.rule_type)}</td>
              {!compact && (
                <>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                        rule.verified
                          ? "border-green-800 text-green-400"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {rule.verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {rule.source_url ? (
                      <a
                        href={rule.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-shield-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
