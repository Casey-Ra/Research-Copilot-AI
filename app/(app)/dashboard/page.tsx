import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ActivitySection } from "@/components/dashboard/ActivitySection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { WorkspacePulse } from "@/components/dashboard/WorkspacePulse";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSnapshot, getRecentWorkspaceActivity } from "@/lib/db/dashboard";
import { getNoteHref } from "@/lib/notes/presentation";

export default async function DashboardPage() {
  const user = await requireUser();
  const [snapshot, activity] = await Promise.all([
    getDashboardSnapshot(user.id),
    getRecentWorkspaceActivity(user.id),
  ]);

  const hasAnyActivity =
    activity.documents.length > 0 || activity.notes.length > 0 || activity.chatSessions.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Pick up where you left off"
        description="See recent documents, chats, notes, and the fastest next steps for continuing your work."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Documents"
          value={snapshot.documentCount}
          description="Everything you have added to this workspace."
        />
        <MetricCard
          label="Ready docs"
          value={snapshot.readyDocumentCount}
          description="Files that are ready for search, summaries, comparison, and chat."
        />
        <MetricCard
          label="Chat sessions"
          value={snapshot.chatSessionCount}
          description="Saved conversations you can reopen any time."
        />
        <MetricCard
          label="Notes"
          value={snapshot.noteCount}
          description="Saved takeaways, excerpts, and answers."
        />
      </div>

      <WorkspacePulse
        readyDocumentCount={snapshot.readyDocumentCount}
        failedDocumentCount={snapshot.failedDocumentCount}
        processingCoverage={snapshot.processingCoverage}
        noteBreakdown={activity.noteBreakdown}
      />

      <QuickActionsPanel
        readyDocumentCount={snapshot.readyDocumentCount}
        noteCount={snapshot.noteCount}
      />

      {hasAnyActivity ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <ActivitySection
            title="Recent documents"
            description="The files you worked with most recently."
            emptyTitle="No documents yet"
            emptyDescription="Upload and process a document to start seeing document activity here."
            items={activity.documents.map((document) => ({
              id: document.id,
              title: document.title,
              meta: `${document.fileName} · ${document._count.chunks} chunks · ${document._count.notes} notes`,
              updatedAt: document.updatedAt,
              href: `/documents/${document.id}`,
              badge: {
                label: document.status,
                tone:
                  document.status === "READY"
                    ? "success"
                    : document.status === "PROCESSING"
                      ? "warning"
                      : document.status === "FAILED"
                        ? "danger"
                        : "neutral",
              },
            }))}
          />
          <ActivitySection
            title="Recent notes"
            description="The latest saved takeaways from your work."
            emptyTitle="No notes yet"
            emptyDescription="Notes will appear here once you save a summary or capture a grounded chat answer."
            items={activity.notes.map((note) => ({
              id: note.id,
              title: note.title,
              meta: note.document
                ? `${note.sourceLabel} · ${note.document.title}`
                : note.sourceLabel,
              updatedAt: note.updatedAt,
              href: getNoteHref(note),
            }))}
          />
          <ActivitySection
            title="Recent chats"
            description="Recent conversations you can continue from here."
            emptyTitle="No chat sessions yet"
            emptyDescription="Ask a grounded question in chat to start building conversation history."
            items={activity.chatSessions.map((chat) => ({
              id: chat.id,
              title: chat.title,
              meta: `${chat._count.messages} messages`,
              updatedAt: chat.updatedAt,
              href: `/chat?session=${chat.id}`,
            }))}
          />
        </div>
      ) : (
        <EmptyState
          eyebrow="Workspace activity"
          title="Your workspace is ready"
          description="Upload a document to start building searches, summaries, chats, and notes."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      )}
    </div>
  );
}
