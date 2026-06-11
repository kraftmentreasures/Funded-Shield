"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { ApiRequestError } from "@/lib/api";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name, email, password });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?registered=1");
      }, 1500);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Unable to create account. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8">
        <Link href="/" className="mb-6 block text-center text-xl font-bold text-shield-500">
          Funded-Shield
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-white">Create account</h1>
        <p className="mb-8 text-sm text-slate-400">
          Start protecting your funded accounts today.
        </p>

        {success && <Alert variant="success" message={success} />}
        {error && <Alert variant="error" message={error} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-slate-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={loading || !!success}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading || !!success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              disabled={loading || !!success}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm text-slate-300">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              disabled={loading || !!success}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-600 focus:border-shield-500 focus:outline-none disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full rounded-lg bg-shield-600 py-2.5 font-semibold text-white hover:bg-shield-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-shield-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
