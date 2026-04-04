import Link from "next/link";
import { SaveSearchNoteButton } from "@/components/search/SaveSearchNoteButton";
import { formatShortDate } from "@/lib/utils/format";

type SearchResultCardProps = {
  rank: number;
  query: string;
  result: {
    chunkId: string;
    score: number;
    documentId: string;
    documentTitle: string;
    fileName: string;
    fileType: string;
    text: string;
    pageNumber: number | null;
    startOffset: number | null;
    endOffset: number | null;
    updatedAt: Date;
  };
};

function buildHighlightedParts(text: string, query: string) {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 2),
    ),
  );

  if (terms.length === 0) {
    return [{ text, match: false }];
  }

  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part) => ({
    text: part,
    match: terms.includes(part.toLowerCase()),
  }));
}

export function SearchResultCard({ rank, query, result }: SearchResultCardProps) {
  const highlightedParts = buildHighlightedParts(result.text, query);

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
          <p className="text-sm text-slate-600">
            {result.fileName} · {result.fileType}
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Score {result.score.toFixed(3)}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">
        {highlightedParts.map((part, index) =>
          part.match ? (
            <mark key={index} className="rounded bg-cyan-100 px-1 text-slate-950">
              {part.text}
            </mark>
          ) : (
            <span key={index}>{part.text}</span>
          ),
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-slate-400">
          <span>Updated {formatShortDate(result.updatedAt)}</span>
          {result.pageNumber ? <span>Page {result.pageNumber}</span> : null}
          {result.startOffset !== null && result.endOffset !== null ? (
            <span>
              Offsets {result.startOffset}-{result.endOffset}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SaveSearchNoteButton
            input={{
              chunkId: result.chunkId,
              documentId: result.documentId,
              documentTitle: result.documentTitle,
              fileName: result.fileName,
              fileType: result.fileType,
              query,
              score: result.score,
              text: result.text,
              pageNumber: result.pageNumber,
              startOffset: result.startOffset,
              endOffset: result.endOffset,
            }}
          />
          <Link
            href={`/documents/${result.documentId}`}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open source
          </Link>
        </div>
      </div>
    </article>
  );
}
