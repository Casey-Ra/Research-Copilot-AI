import { redirect } from "next/navigation";
import { CredentialsSignInForm } from "@/components/auth/CredentialsSignInForm";
import { GitHubSignInButton } from "@/components/auth/GitHubSignInButton";
import { authProviderState } from "@/lib/auth/config";
import { getCurrentSession, resolveCallbackUrl } from "@/lib/auth/session";

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
      <section className="ui-panel-hero p-8 sm:p-10">
        <div className="space-y-6">
          <p className="ui-kicker-on-dark">Welcome back</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              Sign in to open your documents, answers, and saved notes.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-100/86">
              Use GitHub if it is configured, or use the local demo login to explore the app on
              this machine.
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100/90">
                What you can do here
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-100/82">
                Upload source material, search for key passages, compare documents, ask questions
                with citations, and save the takeaways you want to revisit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ui-panel space-y-6 rounded-[2rem] p-8 sm:p-10">
        <div className="space-y-2">
          <p className="ui-kicker">Sign in options</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Choose how you want to sign in
          </h2>
        </div>

        {authProviderState.githubConfigured ? (
          <div className="ui-panel-soft space-y-3 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">GitHub OAuth</h3>
              <p className="text-sm leading-6 text-slate-600">
                Use your GitHub account to access the app.
              </p>
            </div>
            <GitHubSignInButton callbackUrl={callbackUrl} />
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-[rgba(47,103,218,0.18)] bg-[rgba(47,103,218,0.08)] p-5 text-sm leading-6 text-[#183a86]">
            GitHub sign-in is not configured on this machine yet. You can still use the local demo
            account below.
          </div>
        )}

        {authProviderState.demoCredentialsEnabled ? (
          <div className="ui-panel-soft space-y-4 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">Local demo credentials</h3>
              <p className="text-sm leading-6 text-slate-600">
                Use the demo account below if you just want to open the app and try the workflow.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(136,155,194,0.22)] bg-white/78 px-4 py-3 text-sm text-slate-700">
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
