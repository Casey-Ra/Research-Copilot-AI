import { formatShortDate } from "@/lib/utils/format";

type SearchResultCardProps = {
  rank: number;
  result: {
    score: number;
    documentId: string;
    documentTitle: string;
    fileName: string;
    text: string;
    pageNumber: number | null;
    startOffset: number | null;
    endOffset: number | null;
    updatedAt?: Date;
  };
};

export function SearchResultCard({ rank, result }: SearchResultCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Result {rank}
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {result.documentTitle}
          </h3>
          <p className="text-sm text-slate-600">{result.fileName}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Score {result.score.toFixed(3)}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{result.text}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-slate-400">
        {result.pageNumber ? <span>Page {result.pageNumber}</span> : null}
        {result.startOffset !== null && result.endOffset !== null ? (
          <span>
            Offsets {result.startOffset}-{result.endOffset}
          </span>
        ) : null}
        {result.updatedAt ? <span>Updated {formatShortDate(result.updatedAt)}</span> : null}
      </div>
    </article>
  );
}
