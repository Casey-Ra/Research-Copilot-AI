import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { UploadDocumentForm } from "@/components/documents/UploadDocumentForm";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Upload"
        title="Upload research documents into the workspace"
        description="Files and pasted text are validated, stored through a replaceable storage abstraction, and moved through a clean ingestion lifecycle from upload to retrieval-ready document data."
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
              Processing pipeline
            </p>
            <p className="text-sm leading-7 text-slate-600">
              Uploaded sources move through extraction, chunking, embeddings, and status updates so
              they can be searched, summarized, compared, and used in grounded chat.
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
