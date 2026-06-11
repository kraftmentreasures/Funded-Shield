import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-shield-500">
          Funded-Shield
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/prop-firms" className="hover:text-white">
            Prop Firms
          </Link>
          <Link href="/rules" className="hover:text-white">
            Rules
          </Link>
          <Link href="/login" className="hover:text-white">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-shield-600 px-4 py-2 font-medium text-white hover:bg-shield-500"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
