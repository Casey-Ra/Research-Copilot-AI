import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ActivitySection } from "@/components/dashboard/ActivitySection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSnapshot, getRecentWorkspaceActivity } from "@/lib/db/dashboard";

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
        description="This dashboard now reads real per-user data from the database, surfaces recent activity, and establishes the reusable card patterns the rest of the product will build on."
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
          description="Documents already in a ready state for future retrieval and summaries."
        />
        <MetricCard
          label="Chat sessions"
          value={snapshot.chatSessionCount}
          description="Saved conversation threads that will later power grounded chat workflows."
        />
        <MetricCard
          label="Notes"
          value={snapshot.noteCount}
          description="Persistent findings captured from research work and future assistant outputs."
        />
      </div>

      {hasAnyActivity ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <ActivitySection
            title="Recent documents"
            description="The latest documents in this workspace, ordered by most recent activity."
            emptyTitle="No documents yet"
            emptyDescription="Create a draft document from the documents page to start seeing content here."
            items={activity.documents.map((document) => ({
              id: document.id,
              title: document.title,
              meta: "Document record",
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
              meta: `Source: ${note.sourceType.toLowerCase().replace("_", " ")}`,
              updatedAt: note.updatedAt,
              href: "/notes",
            }))}
          />
          <ActivitySection
            title="Recent chats"
            description="Conversation threads created in the workspace and ready for future chat UX."
            emptyTitle="No chat sessions yet"
            emptyDescription="Chat history will appear once the grounded Q&A workflow is implemented."
            items={activity.chatSessions.map((chat) => ({
              id: chat.id,
              title: chat.title,
              meta: "Chat session",
              updatedAt: chat.updatedAt,
              href: "/chat",
            }))}
          />
        </div>
      ) : (
        <EmptyState
          eyebrow="Workspace activity"
          title="Your dashboard is ready for real data"
          description="The data pipeline is working. Create a draft document from the documents page to populate your first dashboard cards and recent activity lists."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      )}
    </div>
  );
}
