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
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#183a86,_#2f67da)] font-bold text-white shadow-[0_18px_34px_-20px_rgba(47,103,218,0.9)]">
            RC
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Research Copilot AI
            </p>
            <p className="text-xs text-slate-400">
              Search, compare, and ask questions across your files
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-col gap-4 lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:gap-5">
          {showWorkspaceNav ? (
            <div className="min-w-0 lg:max-w-[58rem]">
              <NavLinks links={navLinks} />
            </div>
          ) : null}

          <div className="flex items-center gap-3 self-start lg:self-auto">
            {user ? (
              <>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <span className="font-semibold text-white">{user.name ?? "Signed in user"}</span>
                  <span className="ml-2 text-slate-400">{user.email}</span>
                </div>
                <SignOutButton />
              </>
            ) : (
              <>
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:block">
                  Upload documents, find answers, and save notes
                </div>
                <Link href="/sign-in" className="ui-btn-accent px-4 py-2">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
