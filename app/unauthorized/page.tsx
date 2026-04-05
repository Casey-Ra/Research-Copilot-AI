import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="ui-panel mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[2rem] p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#183a86]">
          Unauthorized
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          You do not have access to this area.
        </h1>
        <p className="text-sm leading-7 text-slate-600">
          This request could not be authorized for the current session. Sign in again or return to a
          workspace route you already have access to.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/sign-in"
          className="ui-btn-primary px-4 py-2"
        >
          Go to sign in
        </Link>
        <Link
          href="/"
          className="ui-btn-secondary px-4 py-2"
        >
          Back to landing page
        </Link>
      </div>
    </div>
  );
}
