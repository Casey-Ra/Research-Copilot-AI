import { saveSearchResultNoteAction } from "@/lib/notes/actions";

type SaveSearchNoteButtonProps = {
  input: {
    chunkId: string;
    documentId: string;
    documentTitle: string;
    fileName: string;
    fileType: string;
    query: string;
    score: number;
    text: string;
    pageNumber?: number | null;
    startOffset?: number | null;
    endOffset?: number | null;
  };
};

export function SaveSearchNoteButton({ input }: SaveSearchNoteButtonProps) {
  const action = saveSearchResultNoteAction.bind(null, input);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Save to notes
      </button>
    </form>
  );
}
