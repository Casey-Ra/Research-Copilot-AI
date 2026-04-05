type ChatDocumentScopeProps = {
  documents: {
    id: string;
    title: string;
    fileName: string;
    chunkCount: number;
  }[];
  selectedDocumentIds: string[];
};

export function ChatDocumentScope({
  documents,
  selectedDocumentIds,
}: ChatDocumentScopeProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-slate-700">Document scope</legend>
      {documents.length === 0 ? (
        <p className="rounded-2xl border border-[rgba(136,155,194,0.2)] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,253,246,0.92))] px-4 py-3 text-sm text-slate-600">
          No READY documents are available. Upload and process documents first.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((document) => (
            <label
              key={document.id}
              className="flex gap-3 rounded-[1.25rem] border border-[rgba(136,155,194,0.22)] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,253,246,0.92))] p-4"
            >
              <input
                type="checkbox"
                name="documentId"
                value={document.id}
                defaultChecked={selectedDocumentIds.includes(document.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2f67da]"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-slate-950">{document.title}</span>
                <span className="block text-sm text-slate-600">{document.fileName}</span>
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                  {document.chunkCount} chunks ready
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
