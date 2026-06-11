"use client";

import Link from "next/link";
import { useState } from "react";

import type { User } from "@/types/auth";

interface DashboardNavProps {
  user: User | null;
  onLogout: () => void;
}

export function DashboardNav({ user, onLogout }: DashboardNavProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/accounts", label: "My Accounts" },
    { href: "/alerts", label: "Alerts" },
    { href: "/prop-firms", label: "Prop Firms" },
    { href: "/rules", label: "Rules" },
    { href: "/settings", label: "Settings" },
    ...(user?.is_admin
      ? [{ href: "/admin/prop-firms", label: "Admin: Prop Firms" }]
      : []),
  ];

  function handleLogout() {
    setLoggingOut(true);
    onLogout();
  }

  return (
    <aside className="flex w-56 flex-col border-r border-slate-800 bg-slate-950 p-6">
      <Link href="/" className="mb-8 block text-lg font-bold text-shield-500">
        Funded-Shield
      </Link>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-800 pt-4">
        {user && (
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-60"
        >
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </aside>
  );
}
