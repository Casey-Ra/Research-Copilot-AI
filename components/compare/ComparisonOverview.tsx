import Link from "next/link";
import { SaveComparisonNoteButton } from "@/components/compare/SaveComparisonNoteButton";
import { formatShortDate } from "@/lib/utils/format";

type ComparisonOverviewProps = {
  leftDocument: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    updatedAt: Date;
    summary: string | null;
  };
  rightDocument: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    updatedAt: Date;
    summary: string | null;
  };
  similarityScore: number;
  similarityLabel: "low" | "moderate" | "high";
  focusQuery: string | null;
  comparisonNarrative: string;
  comparedChunkCount: {
    left: number;
    right: number;
  };
};

function getSimilarityTone(label: "low" | "moderate" | "high") {
  if (label === "high") {
    return "bg-[rgba(47,103,218,0.12)] text-[#183a86]";
  }

  if (label === "moderate") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-rose-100 text-rose-700";
}

export function ComparisonOverview({
  leftDocument,
  rightDocument,
  similarityScore,
  similarityLabel,
  focusQuery,
  comparisonNarrative,
  comparedChunkCount,
}: ComparisonOverviewProps) {
  return (
    <section className="ui-panel space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="ui-kicker">Comparison overview</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {leftDocument.title} vs {rightDocument.title}
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            {focusQuery ? `Focused on “${focusQuery}”.` : "Comparing overall processed document content."}
          </p>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${getSimilarityTone(similarityLabel)}`}>
          {similarityLabel} overlap · {similarityScore.toFixed(3)}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SaveComparisonNoteButton
          leftDocumentId={leftDocument.id}
          rightDocumentId={rightDocument.id}
          focusQuery={focusQuery}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[leftDocument, rightDocument].map((document, index) => (
          <article key={document.id} className="ui-panel-soft p-5">
            <div className="space-y-1">
              <p className="ui-kicker">
                {index === 0 ? "Left document" : "Right document"}
              </p>
              <h3 className="text-xl font-semibold text-slate-950">{document.title}</h3>
              <p className="text-sm text-slate-600">
                {document.fileName} · {document.fileType}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Updated {formatShortDate(document.updatedAt)} · compared against{" "}
                {index === 0 ? comparedChunkCount.left : comparedChunkCount.right} chunks
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              {document.summary ?? "No saved summary yet. The comparison is using processed chunks directly."}
            </p>

            <Link
              href={`/documents/${document.id}`}
              className="ui-btn-secondary mt-4 px-4 py-2"
            >
              Open document
            </Link>
          </article>
        ))}
      </div>

      <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#090f1c,_#245bbf)] p-5 text-slate-50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
          Grounded narrative
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {comparisonNarrative}
        </p>
      </div>
    </section>
  );
}
