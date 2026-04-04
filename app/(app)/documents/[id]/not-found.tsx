import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Document not found
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          That document does not exist in this workspace.
        </h1>
        <p className="text-sm leading-7 text-slate-600">
          The record may have been deleted, or it may belong to a different user. Ownership checks
          are enforced server-side before a detail page can render.
        </p>
        <Link
          href="/documents"
          className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to documents
        </Link>
      </div>
    </div>
  );
}
