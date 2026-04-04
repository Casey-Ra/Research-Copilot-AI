import { redirect } from "next/navigation";
import { CredentialsSignInForm } from "@/components/auth/CredentialsSignInForm";
import { authProviderState } from "@/lib/auth/config";
import { getCurrentSession, resolveCallbackUrl } from "@/lib/auth/session";
import { signInWithGitHubAction } from "@/lib/auth/actions";

type SignInPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : undefined;
  const callbackUrl = resolveCallbackUrl(params?.callbackUrl);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-8 text-slate-50 shadow-[0_30px_80px_rgba(2,12,27,0.28)] backdrop-blur sm:p-10">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Phase 1 Authentication
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              Sign in to access your research workspace.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              Protected app routes now require an authenticated session. Use GitHub if you have
              OAuth credentials configured, or use the clearly marked local demo login while we are
              still in the early build phases.
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Route protection
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Middleware blocks the main app routes and the protected app layout performs a
                second server-side session check before rendering workspace content.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Sign in options
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Choose the auth flow that fits your local setup
          </h2>
        </div>

        {authProviderState.githubConfigured ? (
          <form action={signInWithGitHubAction} className="space-y-3 rounded-[1.5rem] border border-slate-200 p-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">GitHub OAuth</h3>
              <p className="text-sm leading-6 text-slate-600">
                Production-style sign-in powered by Auth.js with a GitHub provider.
              </p>
            </div>
            <button
              type="submit"
              className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Continue with GitHub
            </button>
          </form>
        ) : (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            GitHub OAuth is not configured yet. Add `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` to
            your `.env` file when you are ready to test the provider-based flow.
          </div>
        )}

        {authProviderState.demoCredentialsEnabled ? (
          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">Local demo credentials</h3>
              <p className="text-sm leading-6 text-slate-600">
                Temporary development-only fallback for early project phases. This is clearly marked
                so we can remove it later if you want only provider-based auth.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>Email: {authProviderState.demoCredentials.email}</p>
              <p>Password: {authProviderState.demoCredentials.password}</p>
            </div>

            <CredentialsSignInForm callbackUrl={callbackUrl} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
