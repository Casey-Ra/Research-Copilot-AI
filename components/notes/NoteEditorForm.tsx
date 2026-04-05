import Link from "next/link";
import { createManualNoteAction, updateNoteAction } from "@/lib/notes/actions";

type NoteEditorFormProps = {
  mode: "create" | "edit";
  note?: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
  activeView?: string;
  cancelHref?: string;
};

export function NoteEditorForm({ mode, note, activeView, cancelHref }: NoteEditorFormProps) {
  const action =
    mode === "create"
      ? createManualNoteAction
      : updateNoteAction.bind(null, note?.id ?? "");

  return (
    <form action={action} className="ui-panel space-y-4 p-6">
      {activeView ? <input type="hidden" name="view" value={activeView} /> : null}

      <div className="space-y-2">
        <p className="ui-kicker">{mode === "create" ? "Manual note" : "Edit note"}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {mode === "create" ? "Write a research note" : "Refine a saved note"}
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          {mode === "create"
            ? "Capture manual findings, hypotheses, or follow-up tasks alongside your generated outputs."
            : "Update the saved note while preserving its source metadata and workspace links."}
        </p>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Title
        <input
          type="text"
          name="title"
          defaultValue={note?.title ?? ""}
          placeholder="Launch risks to revisit"
          className="ui-field"
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Content
        <textarea
          name="content"
          defaultValue={note?.content ?? ""}
          placeholder="Capture your grounded takeaway, action item, or follow-up question here."
          rows={8}
          className="ui-field min-h-[12rem] resize-y leading-7"
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Tags
        <input
          type="text"
          name="tags"
          defaultValue={note?.tags.join(", ") ?? ""}
          placeholder="launch, risks, follow-up"
          className="ui-field"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="ui-btn-primary"
        >
          {mode === "create" ? "Save manual note" : "Update note"}
        </button>
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="ui-btn-secondary"
          >
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
