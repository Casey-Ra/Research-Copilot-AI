import { notFound } from "next/navigation";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth/session";
import { getDocumentByIdForUser } from "@/lib/db/documents";
import { formatShortDate, formatShortDateTime } from "@/lib/utils/format";

type DocumentDetailPageProps = {
  params: {
    id: string;
  };
};

function getStatusTone(status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED") {
  switch (status) {
    case "READY":
      return "success";
    case "PROCESSING":
      return "warning";
    case "FAILED":
      return "danger";
    default:
      return "neutral";
  }
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const user = await requireUser();
  const document = await getDocumentByIdForUser(params.id, user.id);

  if (!document) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document Detail"
        title={document.title}
        description="This detail page is now backed by a real user-owned document record. It surfaces current metadata, chunk counts, note links, and a safe delete action while richer ingestion features are still in progress."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Source file
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {document.fileName}
              </h2>
            </div>
            <StatusBadge label={document.status} tone={getStatusTone(document.status)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                File type
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{document.fileType}</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Last updated
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatShortDate(document.updatedAt)}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Stored chunks
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{document.chunks.length}</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Linked notes
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{document.notes.length}</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-950">Extracted text preview</h3>
            {document.extractedText ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {document.extractedText}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-600">
                No extracted text has been saved yet. This is expected until the upload and parsing
                phases are implemented.
              </p>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Chunk inspector</h3>
            {document.chunks.length === 0 ? (
              <div className="pt-4">
                <EmptyState
                  eyebrow="Chunks"
                  title="No chunks stored yet"
                  description="Chunk records will appear here after the parsing and chunking pipeline is added."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {document.chunks.map((chunk) => (
                  <article key={chunk.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Chunk {chunk.chunkIndex + 1}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        {formatShortDateTime(chunk.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{chunk.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Document actions</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Phase 3 adds safe delete support. Summaries, search-within-document, and ask-about-this
              actions will arrive in later phases.
            </p>
            <div className="mt-5">
              <DeleteDocumentButton documentId={document.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
