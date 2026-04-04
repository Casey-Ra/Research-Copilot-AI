import Link from "next/link";
import { formatShortDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ChatSessionListProps = {
  sessions: {
    id: string;
    title: string;
    updatedAt: Date;
    lastMessage?: {
      role: "USER" | "ASSISTANT" | "SYSTEM";
      content: string;
    } | null;
    messageCount: number;
  }[];
  activeSessionId?: string;
  selectedDocumentIds: string[];
};

function buildSessionHref(sessionId: string, selectedDocumentIds: string[]) {
  const search = new URLSearchParams();
  search.set("session", sessionId);

  for (const documentId of selectedDocumentIds) {
    search.append("documentId", documentId);
  }

  return `/chat?${search.toString()}`;
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  selectedDocumentIds,
}: ChatSessionListProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Sessions</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Recent chats</h2>
        </div>
        <Link
          href="/chat"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          New thread
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="pt-5 text-sm leading-7 text-slate-600">
          No chat sessions yet. Ask a grounded question to create the first one.
        </p>
      ) : (
        <div className="space-y-3 pt-5">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={buildSessionHref(session.id, selectedDocumentIds)}
              className={cn(
                "block rounded-[1.25rem] border p-4 transition hover:border-cyan-300 hover:bg-cyan-50/40",
                session.id === activeSessionId
                  ? "border-cyan-300 bg-cyan-50/70"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-950">{session.title}</h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {formatShortDateTime(session.updatedAt)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {session.lastMessage?.content ?? "No messages yet"}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {session.messageCount} messages
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
