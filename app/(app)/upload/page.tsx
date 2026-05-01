import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { UploadDocumentForm } from "@/components/documents/UploadDocumentForm";
import { WebTopicImportForm } from "@/components/documents/WebTopicImportForm";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Upload"
        title="Add a document"
        description="Upload a file or paste text to start searching, summarizing, comparing, and asking questions."
      />

      <UploadDocumentForm />

      <WebTopicImportForm />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Supported now
            </p>
            <p className="text-sm leading-7 text-slate-600">
              TXT, PDF, pasted text, and topic imports from Wikipedia + DuckDuckGo.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              What happens next
            </p>
            <p className="text-sm leading-7 text-slate-600">
              Once your file is processed, you can search it, generate summaries, compare it with
              other sources, and ask questions with citations.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Open documents
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
