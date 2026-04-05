import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <div className="ui-panel p-8">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#183a86]">
          Document not found
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          That document does not exist in this workspace.
        </h1>
        <p className="text-sm leading-7 text-slate-600">
          It may have been deleted, moved, or no longer be available to your account.
        </p>
        <Link
          href="/documents"
          className="ui-btn-primary px-4 py-2"
        >
          Back to documents
        </Link>
      </div>
    </div>
  );
}
