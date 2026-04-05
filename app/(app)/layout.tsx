import { requireUser } from "@/lib/auth/session";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="ui-panel-hero">
          <p className="ui-kicker-on-dark">Your workspace</p>
          <div className="mt-6 space-y-4">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
              Welcome back, {user.name ?? "Researcher"}.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-100/86 sm:text-base">
              Pick up with your latest documents, chats, comparisons, and notes in one place.
            </p>
          </div>
        </div>

        <div className="ui-panel flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <p className="ui-kicker">Account</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Ready to continue</h2>
            <p className="text-sm leading-6 text-slate-600">
              Your documents, saved findings, and conversations are available here.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(243,247,255,0.95),_rgba(232,240,255,0.72))] px-4 py-4 text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-950">{user.email}</span>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
