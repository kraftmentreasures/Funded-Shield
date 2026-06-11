import Link from "next/link";
import { Header } from "@/components/ui/Header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-24">
        <section className="text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-shield-500">
            Prop Trading Risk Protection
          </p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Stay funded. Stay compliant.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Funded-Shield monitors your trading activity and alerts you before
            you breach prop firm rules — daily loss limits, drawdown, lot size,
            and more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-shield-600 px-6 py-3 font-semibold text-white hover:bg-shield-500"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:border-slate-500"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Real-time monitoring",
              body: "Track account metrics against your prop firm rules.",
            },
            {
              title: "Instant alerts",
              body: "Get notified via Telegram and email before violations.",
            },
            {
              title: "Multi-firm support",
              body: "Configure rules for FTMO, FundedNext, and more.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-800 bg-slate-950 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
