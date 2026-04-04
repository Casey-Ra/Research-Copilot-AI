type CompareFiltersProps = {
  leftDocumentId: string;
  rightDocumentId: string;
  focusQuery: string;
  documents: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    chunkCount: number;
  }[];
};

export function CompareFilters({
  leftDocumentId,
  rightDocumentId,
  focusQuery,
  documents,
}: CompareFiltersProps) {
  return (
    <form className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Comparison setup
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Pick two READY documents to compare
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          The comparison workflow uses processed chunks and embeddings to show overlap, divergence,
          and an optional focus-specific view when you care about one topic more than the full file.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Left document
          <select
            name="left"
            defaultValue={leftDocumentId}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          >
            <option value="">Select a document</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title} ({document.fileType})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Right document
          <select
            name="right"
            defaultValue={rightDocumentId}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          >
            <option value="">Select a document</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title} ({document.fileType})
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Optional focus query
        <input
          type="text"
          name="focus"
          defaultValue={focusQuery}
          placeholder="Compare these documents about safety recommendations or launch risks"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((document) => (
          <div
            key={document.id}
            className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold text-slate-950">{document.title}</p>
            <p className="mt-1 text-sm text-slate-600">{document.fileName}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
              {document.fileType} · {document.chunkCount} chunks
            </p>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Compare documents
      </button>
    </form>
  );
}
