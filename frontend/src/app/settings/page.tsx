"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardNav } from "@/components/features/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import {
  getTelegramSettings,
  testTelegramConnection,
  updateTelegramSettings,
} from "@/lib/settings";

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setError("");
    try {
      const data = await getTelegramSettings();
      setTokenConfigured(data.telegram_bot_token_set);
      setChatId(data.telegram_chat_id ?? "");
      setAlertsEnabled(data.telegram_alerts_enabled);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      }
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, loadSettings]);

  async function handleSaveTelegram(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: {
        telegram_bot_token?: string;
        telegram_chat_id?: string;
        telegram_alerts_enabled?: boolean;
      } = {
        telegram_chat_id: chatId.trim() || undefined,
        telegram_alerts_enabled: alertsEnabled,
      };
      if (botToken.trim()) {
        payload.telegram_bot_token = botToken.trim();
      }
      const updated = await updateTelegramSettings(payload);
      setTokenConfigured(updated.telegram_bot_token_set);
      setBotToken("");
      setSuccess("Telegram settings saved.");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setError("");
    setSuccess("");
    try {
      const result = await testTelegramConnection();
      setSuccess(result.message);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Test failed.");
      }
    } finally {
      setTesting(false);
    }
  }

  if (authLoading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  if (!user) {
    return null;
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-shield-500 focus:outline-none";

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardNav user={user} onLogout={logout} />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Settings</h1>
        <p className="mb-8 text-slate-400">
          Manage your profile, notifications, and integrations.
        </p>

        {success && <Alert variant="success" message={success} />}
        {error && <Alert variant="error" message={error} />}

        <div className="max-w-xl space-y-6">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="settings-name" className="mb-1 block text-sm text-slate-300">
                  Name
                </label>
                <input
                  id="settings-name"
                  type="text"
                  disabled
                  value={user.name}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-500"
                />
              </div>
              <div>
                <label htmlFor="settings-email" className="mb-1 block text-sm text-slate-300">
                  Email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">
              Telegram alerts
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              Receive risk alerts when daily loss or drawdown thresholds are reached (70%, 90%, violated)
              or when profit targets are hit.
            </p>

            {settingsLoading ? (
              <p className="text-sm text-slate-500">Loading Telegram settings...</p>
            ) : (
              <form onSubmit={handleSaveTelegram} className="space-y-4">
                <div>
                  <label htmlFor="bot-token" className="mb-1 block text-sm text-slate-300">
                    Telegram bot token
                  </label>
                  <input
                    id="bot-token"
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className={inputClass}
                    placeholder={
                      tokenConfigured
                        ? "•••••••• (leave blank to keep current)"
                        : "123456:ABC-DEF..."
                    }
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="chat-id" className="mb-1 block text-sm text-slate-300">
                    Telegram chat ID
                  </label>
                  <input
                    id="chat-id"
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className={inputClass}
                    placeholder="-1001234567890"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={alertsEnabled}
                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-shield-600 focus:ring-shield-500"
                  />
                  <span className="text-sm text-slate-300">Enable Telegram alerts</span>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-500 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save settings"}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || (!tokenConfigured && !botToken.trim()) || !chatId.trim()}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50"
                  >
                    {testing ? "Testing..." : "Test Telegram connection"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Integrations</h2>
            <p className="text-sm text-slate-400">
              MetaTrader 5 auto-sync coming soon. For now, update metrics manually from the dashboard.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
