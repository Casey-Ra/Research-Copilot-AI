import { createManualNoteAction, updateNoteAction } from "@/lib/notes/actions";

type NoteEditorFormProps = {
  mode: "create" | "edit";
  note?: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
  cancelHref?: string;
};

export function NoteEditorForm({ mode, note, cancelHref }: NoteEditorFormProps) {
  const action =
    mode === "create"
      ? createManualNoteAction
      : updateNoteAction.bind(null, note?.id ?? "");

  return (
    <form action={action} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          {mode === "create" ? "Manual note" : "Edit note"}
        </p>
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
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
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
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition focus:border-cyan-400"
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
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {mode === "create" ? "Save manual note" : "Update note"}
        </button>
        {cancelHref ? (
          <a
            href={cancelHref}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </a>
        ) : null}
      </div>
    </form>
  );
}
