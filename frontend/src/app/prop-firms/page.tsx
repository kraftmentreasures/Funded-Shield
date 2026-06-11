"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/lib/api";
import { listPropFirms } from "@/lib/propFirms";
import type { PropFirm } from "@/types/propFirm";

const PAGE_SIZE = 20;

export default function PropFirmsPage() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listPropFirms({ search, page, pageSize: PAGE_SIZE })
        .then((data) => {
          setFirms(data.firms);
          setTotal(data.total);
          setTotalPages(data.total_pages);
          setError("");
        })
        .catch((err) => {
          if (err instanceof ApiRequestError) {
            setError(err.message);
          } else {
            setError("Failed to load prop firms.");
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Prop Firms</h1>
            <p className="mt-2 text-slate-400">
              Browse {total > 0 ? `${total.toLocaleString()} ` : ""}
              verified prop firms. Search to find any firm instantly.
            </p>
          </div>
          <Link href="/rules" className="text-sm text-shield-500 hover:underline">
            View all rules →
          </Link>
        </div>

        <div className="mb-8">
          <input
            type="search"
            placeholder="Search by name or website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <LoadingScreen message="Loading prop firms..." />
        ) : firms.length === 0 ? (
          <p className="text-slate-400">No prop firms match your search.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {firms.map((firm) => (
                <Link
                  key={firm.id}
                  href={`/prop-firms/${firm.id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-shield-600"
                >
                  <h2 className="text-lg font-semibold text-white">{firm.name}</h2>
                  {firm.website && (
                    <p className="mt-1 truncate text-sm text-slate-500">{firm.website}</p>
                  )}
                  <p className="mt-4 text-sm text-shield-500">
                    {firm.rule_count} rule{firm.rule_count !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="prop firms"
            />
          </>
        )}
      </main>
    </div>
  );
}
