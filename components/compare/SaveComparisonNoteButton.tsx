import { saveComparisonNoteAction } from "@/lib/notes/actions";

type SaveComparisonNoteButtonProps = {
  leftDocumentId: string;
  rightDocumentId: string;
  focusQuery?: string | null;
};

export function SaveComparisonNoteButton({
  leftDocumentId,
  rightDocumentId,
  focusQuery,
}: SaveComparisonNoteButtonProps) {
  const action = saveComparisonNoteAction.bind(null, {
    leftDocumentId,
    rightDocumentId,
    focusQuery: focusQuery ?? undefined,
  });

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Save comparison note
      </button>
    </form>
  );
}
