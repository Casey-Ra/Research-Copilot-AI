import { requireUser } from "@/lib/auth/session";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Protected workspace
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Welcome back, {user.name ?? "Researcher"}.
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              These routes are gated behind Auth.js middleware and a server-side layout check.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-950">{user.email}</span>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
