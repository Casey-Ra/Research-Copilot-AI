import { saveChatMessageNoteAction } from "@/lib/notes/actions";

type SaveChatNoteButtonProps = {
  messageId: string;
};

export function SaveChatNoteButton({ messageId }: SaveChatNoteButtonProps) {
  const action = saveChatMessageNoteAction.bind(null, messageId);

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
