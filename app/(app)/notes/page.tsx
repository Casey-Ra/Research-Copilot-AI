import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton";
import { NoteEditorForm } from "@/components/notes/NoteEditorForm";
import { NoteCard } from "@/components/notes/NoteCard";
import { requireUser } from "@/lib/auth/session";
import { getNoteByIdForUser, getNotesForUser } from "@/lib/db/notes";
import {
  getNoteSourceLabel,
  getNoteTags,
  getNoteView,
} from "@/lib/notes/presentation";

type NotesPageProps = {
  searchParams?: Promise<{
    view?: string;
    edit?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const activeView = params?.view ?? "all";
  const editNoteId = params?.edit?.trim() ?? "";
  const successMessage = params?.success?.trim() ?? "";
  const errorMessage = params?.error?.trim() ?? "";
  const [notes, editableNote] = await Promise.all([
    getNotesForUser(user.id),
    editNoteId ? getNoteByIdForUser(editNoteId, user.id) : Promise.resolve(null),
  ]);
  const resolvedErrorMessage =
    errorMessage ||
    (editNoteId && !editableNote
      ? "That note could not be loaded. It may have been deleted or may not belong to this workspace."
      : "");
  const filteredNotes =
    activeView === "all" ? notes : notes.filter((note) => getNoteView(note) === activeView);
  const counts = {
    all: notes.length,
    manual: notes.filter((note) => getNoteView(note) === "manual").length,
    summary: notes.filter((note) => getNoteView(note) === "summary").length,
    search: notes.filter((note) => getNoteView(note) === "search").length,
    compare: notes.filter((note) => getNoteView(note) === "compare").length,
    chat: notes.filter((note) => getNoteView(note) === "chat").length,
  };
  const views = [
    { id: "all", label: "All", count: counts.all },
    { id: "manual", label: "Manual", count: counts.manual },
    { id: "summary", label: "Summaries", count: counts.summary },
    { id: "search", label: "Search", count: counts.search },
    { id: "compare", label: "Compare", count: counts.compare },
    { id: "chat", label: "Chat", count: counts.chat },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notes"
        title="Saved findings and reusable outputs"
        description="This notes workspace now stores durable research artifacts from summaries, search, comparison, and grounded chat. It acts as the persistent layer for discoveries made elsewhere in the product."
      />

      {successMessage ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {resolvedErrorMessage ? (
        <p className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {resolvedErrorMessage}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <NoteEditorForm mode="create" activeView={activeView} />

        {editableNote ? (
          <NoteEditorForm
            mode="edit"
            note={{
              id: editableNote.id,
              title: editableNote.title,
              content: editableNote.content,
              tags: getNoteTags(editableNote.tags),
            }}
            activeView={activeView}
            cancelHref={activeView === "all" ? "/notes" : `/notes?view=${activeView}`}
          />
        ) : (
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Note editing
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Refine any saved artifact
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                Manual notes can be authored from scratch, and any saved note can be revised from
                the list below without losing its source metadata or workspace links.
              </p>
            </div>
          </section>
        )}
      </div>

      <section className="flex flex-wrap gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        {views.map((view) => {
          const isActive = view.id === activeView;

          return (
            <Link
              key={view.id}
              href={view.id === "all" ? "/notes" : `/notes?view=${view.id}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {view.label} ({view.count})
            </Link>
          );
        })}
      </section>

      {filteredNotes.length === 0 ? (
        <EmptyState
          eyebrow="Notes"
          title="No saved notes yet"
          description="Generate a document summary, save a search finding, or capture a comparison note to start building a reusable research notebook."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              content={note.content}
              sourceType={note.sourceType}
              sourceLabel={getNoteSourceLabel(note)}
              tags={getNoteTags(note.tags)}
              updatedAt={note.updatedAt}
              actions={
                <>
                  <Link
                    href={
                      activeView === "all"
                        ? `/notes?edit=${note.id}`
                        : `/notes?view=${activeView}&edit=${note.id}`
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <DeleteNoteButton noteId={note.id} view={activeView} />
                </>
              }
              document={note.document}
            />
          ))}
        </div>
      )}
    </div>
  );
}
