import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { NavLinks } from "@/components/NavLinks";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/documents", label: "Documents" },
  { href: "/compare", label: "Compare" },
  { href: "/search", label: "Search" },
  { href: "/chat", label: "Chat" },
  { href: "/notes", label: "Notes" },
];

export async function Navbar() {
  const session = await getCurrentSession();
  const user = session?.user;
  const showWorkspaceNav = Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(9,15,28,0.92)] text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,_#183a86,_#2f67da)] text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(47,103,218,0.9)]">
            RC
          </div>
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            Research Copilot AI
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 lg:inline-flex">
                <span className="font-semibold text-white">{user.name ?? "Signed in"}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{user.email}</span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <Link href="/sign-in" className="ui-btn-accent px-4 py-2 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {showWorkspaceNav ? (
        <div className="mx-auto w-full max-w-7xl px-5 pb-3 sm:px-8 lg:px-10">
          <NavLinks links={navLinks} />
        </div>
      ) : null}
    </header>
  );
}
