import { PageHeader } from "@/components/PageHeader";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatConversation } from "@/components/chat/ChatConversation";
import { ChatSessionList } from "@/components/chat/ChatSessionList";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { coerceQueryArray } from "@/lib/chat/session";
import { getChatSessionByIdForUser, getChatSessionsForUser } from "@/lib/db/chat";
import { getReadyDocumentsForUser } from "@/lib/db/retrieval";
import type { JsonCitation } from "@/types/database";

type ChatPageProps = {
  searchParams?: Promise<{
    session?: string;
    documentId?: string | string[];
    error?: string;
  }>;
};

function parseCitations(value: unknown): JsonCitation[] {
  return Array.isArray(value) ? (value as JsonCitation[]) : [];
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const activeSessionId = params?.session;
  const selectedDocumentIds = coerceQueryArray(params?.documentId);
  const errorMessage = params?.error;

  const [sessions, readyDocuments, activeSession] = await Promise.all([
    getChatSessionsForUser(user.id),
    getReadyDocumentsForUser(user.id),
    activeSessionId ? getChatSessionByIdForUser(activeSessionId, user.id) : Promise.resolve(null),
  ]);

  const mappedSessions = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt,
    messageCount: session._count.messages,
    lastMessage: session.messages[0] ?? null,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chat"
        title="Ask questions with sources"
        description="Get answers backed by your documents, and keep the conversation history for later."
      />

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {readyDocuments.length === 0 ? (
        <EmptyState
          eyebrow="Chat"
          title="No ready documents yet"
          description="Upload and process at least one document before asking questions here."
          actionLabel="Go to upload"
          actionHref="/upload"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
          <div className="space-y-6">
            <ChatSessionList
              sessions={mappedSessions}
              activeSessionId={activeSession?.id}
              selectedDocumentIds={selectedDocumentIds}
            />

            <ChatComposer
              activeSessionId={activeSession?.id}
              selectedDocumentIds={selectedDocumentIds}
              documents={readyDocuments.map((document) => ({
                id: document.id,
                title: document.title,
                fileName: document.fileName,
                chunkCount: document._count.chunks,
              }))}
            />
          </div>

          <ChatConversation
            sessionTitle={activeSession?.title}
            messages={
              activeSession?.messages.map((message) => ({
                id: message.id,
                role: message.role,
                content: message.content,
                createdAt: message.createdAt,
                citations: parseCitations(message.citations),
              })) ?? []
            }
          />
        </div>
      )}
    </div>
  );
}
