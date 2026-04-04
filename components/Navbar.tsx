import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/documents", label: "Documents" },
  { href: "/search", label: "Search" },
  { href: "/chat", label: "Chat" },
  { href: "/notes", label: "Notes" },
];

export async function Navbar() {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 text-slate-50 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 font-bold text-slate-950">
            RC
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Research Copilot AI
            </p>
            <p className="text-xs text-slate-400">Document intelligence workspace</p>
          </div>
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            {user ? (
              <>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  <span className="font-semibold text-white">{user.name ?? "Signed in user"}</span>
                  <span className="ml-2 text-slate-400">{user.email}</span>
                </div>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
