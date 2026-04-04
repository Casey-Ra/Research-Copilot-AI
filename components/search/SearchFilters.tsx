type SearchFiltersProps = {
  query: string;
  selectedDocumentIds: string[];
  documents: {
    id: string;
    title: string;
    fileName: string;
    chunkCount: number;
  }[];
};

export function SearchFilters({
  query,
  selectedDocumentIds,
  documents,
}: SearchFiltersProps) {
  return (
    <form className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Retrieval query
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Search across embedded document chunks
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          This is a thin Phase 6 verification UI for the retrieval layer. The fuller search
          experience can still be polished in the next dedicated phase.
        </p>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Query
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder="What does this document say about grounded answers?"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Optional document filter</legend>
        {documents.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No READY documents are available yet. Upload and process a document first.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <label
                key={document.id}
                className="flex gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
              >
                <input
                  type="checkbox"
                  name="documentId"
                  value={document.id}
                  defaultChecked={selectedDocumentIds.includes(document.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-slate-950">{document.title}</span>
                  <span className="block text-sm text-slate-600">{document.fileName}</span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                    {document.chunkCount} chunks
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <button
        type="submit"
        className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Run semantic search
      </button>
    </form>
  );
}
