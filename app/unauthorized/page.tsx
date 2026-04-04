import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Unauthorized
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          You do not have access to this area.
        </h1>
        <p className="text-sm leading-7 text-slate-600">
          This route is reserved for future ownership and authorization failures that are different
          from simply being signed out.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/sign-in"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to sign in
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to landing page
        </Link>
      </div>
    </div>
  );
}
