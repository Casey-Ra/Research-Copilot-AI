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
        title="Your research workspace at a glance"
        description="See the health of your workspace, recent activity across documents and notes, and the fastest next steps for moving from upload to grounded research output."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Documents"
          value={snapshot.documentCount}
          description="All document records currently owned by this signed-in user."
        />
        <MetricCard
          label="Ready docs"
          value={snapshot.readyDocumentCount}
          description="Documents already processed and available for search, comparison, summaries, and chat."
        />
        <MetricCard
          label="Chat sessions"
          value={snapshot.chatSessionCount}
          description="Saved grounded conversations tied back to the user's document workspace."
        />
        <MetricCard
          label="Notes"
          value={snapshot.noteCount}
          description="Persistent findings captured from summaries, search, comparison, and chat."
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
            description="The latest documents in this workspace, ordered by most recent activity."
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
            description="Saved findings and note records connected to this user's workspace."
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
            description="Conversation threads created in the workspace for grounded document Q&A."
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
          title="Your dashboard is ready for real data"
          description="Upload and process a document to start populating dashboard cards, search results, comparisons, and saved notes."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      )}
    </div>
  );
}
