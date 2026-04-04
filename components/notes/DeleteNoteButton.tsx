import { deleteNoteAction } from "@/lib/notes/actions";

type DeleteNoteButtonProps = {
  noteId: string;
};

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const action = deleteNoteAction.bind(null, noteId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Delete
      </button>
    </form>
  );
}
