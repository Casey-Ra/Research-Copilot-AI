import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { UploadDocumentForm } from "@/components/documents/UploadDocumentForm";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Upload"
        title="Upload research documents into the workspace"
        description="This phase adds the local development storage pipeline. Files and pasted text are validated, saved through a storage abstraction, and recorded in the database with a clean status model."
      />

      <UploadDocumentForm />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Supported now
            </p>
            <p className="text-sm leading-7 text-slate-600">
              TXT, PDF, and pasted text with local filesystem storage for development.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Deferred next
            </p>
            <p className="text-sm leading-7 text-slate-600">
              Parsing, chunking, and status transitions from `UPLOADED` into later ingestion states.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Manage records
            </p>
            <Link
              href="/documents"
              className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View documents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
