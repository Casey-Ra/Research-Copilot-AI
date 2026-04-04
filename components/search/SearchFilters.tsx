type SearchFiltersProps = {
  query: string;
  selectedDocumentIds: string[];
  selectedFileTypes: string[];
  dateWindowDays: number | null;
  limit: number;
  documents: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    chunkCount: number;
  }[];
};

export function SearchFilters({
  query,
  selectedDocumentIds,
  selectedFileTypes,
  dateWindowDays,
  limit,
  documents,
}: SearchFiltersProps) {
  const availableFileTypes = Array.from(new Set(documents.map((document) => document.fileType))).sort();

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
          Search processed documents semantically, narrow the scope with filters, and save strong
          hits into notes when you find something worth keeping.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.35fr_0.35fr]">
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

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Date filter
          <select
            name="dateWindow"
            defaultValue={dateWindowDays ? String(dateWindowDays) : "any"}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          >
            <option value="any">Any time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Result count
          <select
            name="limit"
            defaultValue={String(limit)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          >
            <option value="5">Top 5</option>
            <option value="8">Top 8</option>
            <option value="12">Top 12</option>
          </select>
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">File type filter</legend>
        {availableFileTypes.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            File type filters will appear after READY documents are available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availableFileTypes.map((fileType) => (
              <label
                key={fileType}
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  name="fileType"
                  value={fileType}
                  defaultChecked={selectedFileTypes.includes(fileType)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                />
                <span>{fileType}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

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
                  <span className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                    <span>{document.fileType}</span>
                    <span>{document.chunkCount} chunks</span>
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
