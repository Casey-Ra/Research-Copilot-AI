import type { DocumentSummaryEntry, DocumentSummaryType } from "@/types/database";
import { GenerateSummaryButton } from "@/components/documents/GenerateSummaryButton";
import { SaveSummaryNoteButton } from "@/components/documents/SaveSummaryNoteButton";
import { formatShortDateTime } from "@/lib/utils/format";

type SummaryCardProps = {
  documentId: string;
  summaryType: DocumentSummaryType;
  title: string;
  description: string;
  summary: DocumentSummaryEntry | null;
  error?: string | null;
  canGenerate: boolean;
};

export function SummaryCard({
  documentId,
  summaryType,
  title,
  description,
  summary,
  error,
  canGenerate,
}: SummaryCardProps) {
  const buttonLabel = summary ? "Refresh summary" : "Generate summary";

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {summary ? (
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {summary.provider === "openai" ? "Model summary" : "Fallback summary"}
          </p>
        ) : null}
      </div>

      {summary ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.25rem] bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{summary.content}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-400">
            <span>Generated {formatShortDateTime(summary.generatedAt)}</span>
            <span>
              Evidence {summary.chunkCount}/{summary.totalChunks || summary.chunkCount} chunks
            </span>
            <span>{summary.evidenceMode.replace("-", " ")}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {canGenerate
            ? "No summary has been generated yet for this view."
            : "This document needs extracted text before a grounded summary can be generated."}
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <GenerateSummaryButton
          documentId={documentId}
          summaryType={summaryType}
          label={buttonLabel}
        />
        {summary ? (
          <SaveSummaryNoteButton documentId={documentId} summaryType={summaryType} />
        ) : null}
      </div>
    </article>
  );
}
