import Link from "next/link";
import type { JsonCitation } from "@/types/database";

type CitationListProps = {
  citations: JsonCitation[];
};

function buildLocationLabel(citation: JsonCitation) {
  if (citation.pageNumber !== undefined) {
    return `Page ${citation.pageNumber}`;
  }

  if (
    typeof citation.startOffset === "number" &&
    typeof citation.endOffset === "number"
  ) {
    return `Offsets ${citation.startOffset}-${citation.endOffset}`;
  }

  return "Location unavailable";
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Citations</p>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <article key={`${citation.documentId}-${citation.chunkId ?? index}`} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  [{index + 1}] {citation.documentTitle ?? "Source document"}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {citation.fileName ?? "Unknown file"} · {buildLocationLabel(citation)}
                </p>
              </div>
              <Link
                href={`/documents/${citation.documentId}`}
                className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Open source
              </Link>
            </div>
            {citation.quote ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">{citation.quote}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
