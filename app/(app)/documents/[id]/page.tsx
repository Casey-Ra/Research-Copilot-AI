import { notFound } from "next/navigation";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";
import { SummaryCard } from "@/components/documents/SummaryCard";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProcessDocumentButton } from "@/components/documents/ProcessDocumentButton";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth/session";
import {
  getDocumentSummaryError,
  getDocumentSummaryFromMetadata,
} from "@/lib/documents/metadata";
import { getAllSummaryTypes, getSummaryConfig } from "@/lib/documents/summaries";
import { getDocumentByIdForUser } from "@/lib/db/documents";
import { formatShortDate, formatShortDateTime } from "@/lib/utils/format";
import type { DocumentSummaryType } from "@/types/database";

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

const summaryDescriptions: Record<DocumentSummaryType, string> = {
  concise: "A short grounded overview for quick orientation before diving into the full text.",
  bullets: "A scannable bullet version for recruiters, collaborators, or later review.",
  takeaways: "The most important conclusions or insights supported by the processed document text.",
  actionItems: "Explicit next steps only when the document actually supports them.",
};

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const user = await requireUser();
  const document = await getDocumentByIdForUser(params.id, user.id);

  if (!document) {
    notFound();
  }

  const canGenerateSummaries = Boolean(document.extractedText?.trim()) || document.chunks.length > 0;
  const summaryCards = getAllSummaryTypes().map((summaryType) => ({
    summaryType,
    config: getSummaryConfig(summaryType),
    summary: getDocumentSummaryFromMetadata(document.metadata, summaryType),
    error: getDocumentSummaryError(document.metadata, summaryType),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document Detail"
        title={document.title}
        description="This detail page is now grounded in real processed content. You can inspect chunk data, generate citation-safe summaries from the extracted text, and save summary outputs into your notes workspace."
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
                File size
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {document.fileSizeBytes ? `${Math.max(1, Math.round(document.fileSizeBytes / 1024))} KB` : "-"}
              </p>
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
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                <p>
                  No extracted text has been saved yet. This usually means the document has not been
                  processed successfully or extraction failed on the last attempt.
                </p>
                {document.storagePath ? (
                  <p>
                    Local storage path: <span className="font-medium text-slate-950">{document.storagePath}</span>
                  </p>
                ) : null}
                {document.metadata &&
                typeof document.metadata === "object" &&
                "ingestionError" in document.metadata &&
                typeof document.metadata.ingestionError === "string" ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Last ingestion error: {document.metadata.ingestionError}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <section className="space-y-4 rounded-[1.5rem] border border-slate-200 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">Grounded summaries</h3>
              <p className="text-sm leading-6 text-slate-600">
                Each summary is generated only from this document&apos;s processed text. When a model
                is not configured, the app falls back to deterministic extraction instead of
                inventing unsupported claims.
              </p>
            </div>
            <div className="grid gap-4">
              {summaryCards.map(({ summaryType, config, summary, error }) => (
                <SummaryCard
                  key={summaryType}
                  documentId={document.id}
                  summaryType={summaryType}
                  title={config.title}
                  description={summaryDescriptions[summaryType]}
                  summary={summary}
                  error={error}
                  canGenerate={canGenerateSummaries}
                />
              ))}
            </div>
          </section>
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Chunk inspector</h3>
            {document.chunks.length === 0 ? (
              <div className="pt-4">
                <EmptyState
                  eyebrow="Chunks"
                  title="No chunks stored yet"
                  description="Chunk records appear after processing succeeds. Re-run ingestion if this document should already be ready for retrieval."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {document.chunks.map((chunk) => (
                  <article key={chunk.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-950">
                          Chunk {chunk.chunkIndex + 1}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                          {chunk.pageNumber ? <span>Page {chunk.pageNumber}</span> : null}
                          {chunk.startOffset !== null && chunk.endOffset !== null ? (
                            <span>
                              Offsets {chunk.startOffset}-{chunk.endOffset}
                            </span>
                          ) : null}
                        </div>
                      </div>
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
              The ingestion pipeline can be rerun at any time. Summary generation stays separate
              from chat so this page can create durable research artifacts tied directly to the
              source document.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ProcessDocumentButton
                documentId={document.id}
                label={document.status === "FAILED" ? "Retry processing" : "Reprocess document"}
              />
              <DeleteDocumentButton documentId={document.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
