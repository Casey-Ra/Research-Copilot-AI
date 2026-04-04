type PossibleContradictionsPanelProps = {
  items: {
    score: number;
    reason: string;
    left: {
      chunkIndex: number;
      text: string;
      pageNumber: number | null;
      startOffset: number | null;
      endOffset: number | null;
    };
    right: {
      chunkIndex: number;
      text: string;
      pageNumber: number | null;
      startOffset: number | null;
      endOffset: number | null;
    };
  }[];
  leftTitle: string;
  rightTitle: string;
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

export function PossibleContradictionsPanel({
  items,
  leftTitle,
  rightTitle,
}: PossibleContradictionsPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Possible contradictions
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Tension points worth reviewing
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          These only appear when matched excerpts discuss overlapping terms but diverge in negation
          or direction. They are prompts for review, not automatic claims of contradiction.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          No supported contradiction signals surfaced from the compared evidence.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item, index) => (
            <article key={`${item.left.chunkIndex}-${item.right.chunkIndex}-${index}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Signal {index + 1}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Shared similarity {item.score.toFixed(3)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">{item.reason}</p>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">{leftTitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    Chunk {item.left.chunkIndex + 1} · {renderLocation(item.left)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{item.left.text}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">{rightTitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    Chunk {item.right.chunkIndex + 1} · {renderLocation(item.right)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{item.right.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
