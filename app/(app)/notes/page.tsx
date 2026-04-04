import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { NoteCard } from "@/components/notes/NoteCard";
import { requireUser } from "@/lib/auth/session";
import { getNotesForUser } from "@/lib/db/notes";

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await getNotesForUser(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notes"
        title="Saved findings and reusable outputs"
        description="This notes workspace now stores durable research artifacts, including summary snapshots tied back to their source documents. It is the destination for save-from-summary flows and later save-from-chat flows."
      />

      {notes.length === 0 ? (
        <EmptyState
          eyebrow="Notes"
          title="No saved notes yet"
          description="Generate a document summary or save a grounded chat answer to start building a reusable research notebook."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              content={note.content}
              sourceType={note.sourceType}
              updatedAt={note.updatedAt}
              document={note.document}
            />
          ))}
        </div>
      )}
    </div>
  );
}
