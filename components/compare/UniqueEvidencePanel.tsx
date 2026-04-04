type UniqueEvidencePanelProps = {
  title: string;
  description: string;
  items: {
    chunkId: string;
    chunkIndex: number;
    text: string;
    pageNumber: number | null;
    startOffset: number | null;
    endOffset: number | null;
    uniquenessScore: number;
  }[];
};

function renderLocation(input: {
  pageNumber: number | null;
  startOffset: number | null;
  endOffset: number | null;
}) {
  if (input.pageNumber) {
    return `Page ${input.pageNumber}`;
  }

  if (input.startOffset !== null && input.endOffset !== null) {
    return `Offsets ${input.startOffset}-${input.endOffset}`;
  }

  return "Location unavailable";
}

export function UniqueEvidencePanel({
  title,
  description,
  items,
}: UniqueEvidencePanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          No clearly unique evidence surfaced from the sampled comparison chunks.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <article key={item.chunkId} className="rounded-[1.25rem] bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">Chunk {item.chunkIndex + 1}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Uniqueness {item.uniquenessScore.toFixed(3)} · {renderLocation(item)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">{item.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
