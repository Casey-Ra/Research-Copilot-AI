type SearchSummaryProps = {
  query: string;
  resultCount: number;
  totalCandidates: number;
  selectedDocumentCount: number;
  selectedFileTypes: string[];
  dateWindowDays: number | null;
  limit: number;
};

function formatDateWindowLabel(dateWindowDays: number | null) {
  if (!dateWindowDays) {
    return "Any time";
  }

  return `Last ${dateWindowDays} days`;
}

export function SearchSummary({
  query,
  resultCount,
  totalCandidates,
  selectedDocumentCount,
  selectedFileTypes,
  dateWindowDays,
  limit,
}: SearchSummaryProps) {
  return (
    <section className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-4">
      <div className="space-y-1 lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Search summary
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {resultCount} ranked result{resultCount === 1 ? "" : "s"} for “{query}”
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Ranked from {totalCandidates} candidate chunk{totalCandidates === 1 ? "" : "s"} with
          semantic similarity.
        </p>
      </div>

      <div className="rounded-[1.25rem] bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Scope</p>
        <p className="mt-2 text-sm font-semibold text-slate-950">
          {selectedDocumentCount > 0 ? `${selectedDocumentCount} selected docs` : "All READY docs"}
        </p>
      </div>

      <div className="rounded-[1.25rem] bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Filters</p>
        <p className="mt-2 text-sm font-semibold text-slate-950">
          {selectedFileTypes.length > 0 ? selectedFileTypes.join(", ") : "All file types"}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
          {formatDateWindowLabel(dateWindowDays)} · top {limit}
        </p>
      </div>
    </section>
  );
}
