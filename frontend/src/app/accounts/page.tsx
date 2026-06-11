"use client";

import { useCallback, useEffect, useState } from "react";

import { AccountForm } from "@/components/features/AccountForm";
import { AccountsTable } from "@/components/features/AccountsTable";
import { MetricsUpdateForm } from "@/components/features/MetricsUpdateForm";
import { DashboardNav } from "@/components/features/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
} from "@/lib/accounts";
import type { AccountFormData, TradingAccount } from "@/types/account";

type ModalMode = "add" | "edit" | "metrics" | null;

export default function AccountsPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [metricsAccount, setMetricsAccount] = useState<TradingAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAccounts();
      setAccounts(data.accounts);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to load accounts.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user, loadAccounts]);

  function openAddModal() {
    setEditingAccount(null);
    setModalMode("add");
    setSuccess("");
  }

  function openEditModal(account: TradingAccount) {
    setEditingAccount(account);
    setModalMode("edit");
    setSuccess("");
  }

  function closeModal() {
    setModalMode(null);
    setEditingAccount(null);
    setMetricsAccount(null);
  }

  function openMetricsModal(account: TradingAccount) {
    setMetricsAccount(account);
    setModalMode("metrics");
    setSuccess("");
  }

  function handleMetricsSuccess(updated: TradingAccount) {
    setSuccess(`Metrics updated. Risk status: ${updated.risk_status}.`);
    closeModal();
    loadAccounts();
  }

  async function handleCreate(data: AccountFormData) {
    await createAccount(data);
    setSuccess("Account created successfully.");
    closeModal();
    await loadAccounts();
  }

  async function handleUpdate(data: AccountFormData) {
    if (!editingAccount) return;
    await updateAccount(editingAccount.id, data);
    setSuccess("Account updated successfully.");
    closeModal();
    await loadAccounts();
  }

  async function handleDelete(account: TradingAccount) {
    if (!confirm(`Delete "${account.account_name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(account.id);
    setError("");
    try {
      await deleteAccount(account.id);
      setSuccess("Account deleted.");
      await loadAccounts();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to delete account.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardNav user={user} onLogout={logout} />
      <main className="flex-1 p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Accounts</h1>
            <p className="mt-1 text-slate-400">
              Manage your prop firm trading accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-shield-600 px-4 py-2 font-semibold text-white hover:bg-shield-500"
          >
            + Add Account
          </button>
        </div>

        {success && <Alert variant="success" message={success} />}
        {error && <Alert variant="error" message={error} />}

        {loading ? (
          <LoadingScreen message="Loading accounts..." />
        ) : (
          <AccountsTable
            accounts={accounts}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onUpdateMetrics={openMetricsModal}
            deletingId={deletingId}
          />
        )}

        {modalMode && modalMode !== "metrics" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-bold text-white">
                {modalMode === "add" ? "Add Account" : "Edit Account"}
              </h2>
              <AccountForm
                initial={modalMode === "edit" ? editingAccount : null}
                onSubmit={modalMode === "add" ? handleCreate : handleUpdate}
                onCancel={closeModal}
                submitLabel={modalMode === "add" ? "Create account" : "Save changes"}
              />
            </div>
          </div>
        )}

        {modalMode === "metrics" && metricsAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-bold text-white">Update metrics</h2>
              <MetricsUpdateForm
                account={metricsAccount}
                onSuccess={handleMetricsSuccess}
                onCancel={closeModal}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
