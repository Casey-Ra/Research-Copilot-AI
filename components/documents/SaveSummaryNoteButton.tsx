import type { DocumentSummaryType } from "@/types/database";
import { saveDocumentSummaryToNoteAction } from "@/lib/documents/actions";

type SaveSummaryNoteButtonProps = {
  documentId: string;
  summaryType: DocumentSummaryType;
};

export function SaveSummaryNoteButton({
  documentId,
  summaryType,
}: SaveSummaryNoteButtonProps) {
  const action = saveDocumentSummaryToNoteAction.bind(null, documentId, summaryType);

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
