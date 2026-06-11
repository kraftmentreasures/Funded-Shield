"use client";

import { useCallback, useEffect, useState } from "react";

import { PropFirmAdminForm } from "@/components/features/PropFirmAdminForm";
import { DashboardNav } from "@/components/features/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import {
  adminCreatePropFirm,
  adminDeletePropFirm,
  adminUpdatePropFirm,
} from "@/lib/adminPropFirms";
import { listPropFirms } from "@/lib/propFirms";
import type { PropFirm, PropFirmFormData } from "@/types/propFirm";

type ModalMode = "add" | "edit" | null;

const PAGE_SIZE = 20;

export default function AdminPropFirmsPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFirms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPropFirms({
        search,
        activeOnly: false,
        page,
        pageSize: PAGE_SIZE,
      });
      setFirms(data.firms);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (user?.is_admin) {
      loadFirms();
    } else if (user && !user.is_admin) {
      setLoading(false);
    }
  }, [user, loadFirms]);

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return null;
  }

  if (!user.is_admin) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <DashboardNav user={user} onLogout={logout} />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-white">Access denied</h1>
          <p className="mt-2 text-slate-400">
            Admin access is required. Set your email in ADMIN_EMAILS or contact support.
          </p>
        </main>
      </div>
    );
  }

  async function handleCreate(data: PropFirmFormData) {
    await adminCreatePropFirm(data);
    setSuccess("Prop firm created.");
    setModalMode(null);
    await loadFirms();
  }

  async function handleUpdate(data: PropFirmFormData) {
    if (!editingFirm) return;
    await adminUpdatePropFirm(editingFirm.id, data);
    setSuccess("Prop firm updated.");
    setModalMode(null);
    setEditingFirm(null);
    await loadFirms();
  }

  async function handleDelete(firm: PropFirm) {
    if (!confirm(`Delete "${firm.name}" and all its rules? This cannot be undone.`)) {
      return;
    }
    setDeletingId(firm.id);
    setError("");
    try {
      await adminDeletePropFirm(firm.id);
      setSuccess(`"${firm.name}" deleted.`);
      await loadFirms();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to delete prop firm.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardNav user={user} onLogout={logout} />
      <main className="flex-1 p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Prop Firms</h1>
            <p className="mt-1 text-slate-400">Add, edit, or delete prop firms and their catalog.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingFirm(null);
              setModalMode("add");
              setSuccess("");
            }}
            className="rounded-lg bg-shield-600 px-4 py-2 font-semibold text-white hover:bg-shield-500"
          >
            + Add Prop Firm
          </button>
        </div>

        {success && <Alert variant="success" message={success} />}
        {error && <Alert variant="error" message={error} />}

        <div className="mb-6">
          <input
            type="search"
            placeholder="Search prop firms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <LoadingScreen message="Loading prop firms..." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-400">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Website</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Rules</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {firms.map((firm) => (
                  <tr key={firm.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-medium text-white">{firm.name}</td>
                    <td className="px-4 py-3 text-slate-400">{firm.website ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{firm.rule_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          firm.is_active ? "text-green-400" : "text-slate-500"
                        }
                      >
                        {firm.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFirm(firm);
                            setModalMode("edit");
                            setSuccess("");
                          }}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-shield-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(firm)}
                          disabled={deletingId === firm.id}
                          className="rounded-lg border border-red-900 px-3 py-1 text-xs text-red-400 hover:border-red-700 disabled:opacity-50"
                        >
                          {deletingId === firm.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="prop firms"
            />
          </div>
        )}

        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-bold text-white">
                {modalMode === "add" ? "Add Prop Firm" : "Edit Prop Firm"}
              </h2>
              <PropFirmAdminForm
                initial={modalMode === "edit" ? editingFirm : null}
                onSubmit={modalMode === "add" ? handleCreate : handleUpdate}
                onCancel={() => {
                  setModalMode(null);
                  setEditingFirm(null);
                }}
                submitLabel={modalMode === "add" ? "Create" : "Save changes"}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
