type SharedEvidenceCardProps = {
  rank: number;
  pair: {
    score: number;
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
  };
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

export function SharedEvidenceCard({
  rank,
  pair,
  leftTitle,
  rightTitle,
}: SharedEvidenceCardProps) {
  return (
    <article className="ui-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="ui-kicker">Shared evidence {rank}</p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            Similarity score {pair.score.toFixed(3)}
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,253,246,0.92))] p-4">
          <p className="text-sm font-semibold text-slate-950">{leftTitle}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
            Chunk {pair.left.chunkIndex + 1} · {renderLocation(pair.left)}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{pair.left.text}</p>
        </section>

        <section className="rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,253,246,0.92))] p-4">
          <p className="text-sm font-semibold text-slate-950">{rightTitle}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
            Chunk {pair.right.chunkIndex + 1} · {renderLocation(pair.right)}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{pair.right.text}</p>
        </section>
      </div>
    </article>
  );
}
