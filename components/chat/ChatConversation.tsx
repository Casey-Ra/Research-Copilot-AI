import { ChatMessageCard } from "@/components/chat/ChatMessageCard";
import { EmptyState } from "@/components/EmptyState";
import type { JsonCitation } from "@/types/database";

type ChatConversationProps = {
  sessionTitle?: string;
  messages: {
    id: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    createdAt: Date;
    citations?: JsonCitation[];
  }[];
};

export function ChatConversation({ sessionTitle, messages }: ChatConversationProps) {
  return (
    <section className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Conversation
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {sessionTitle ?? "New grounded chat"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Ask a question and the assistant will answer only from retrieved evidence.
        </p>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          eyebrow="Chat"
          title="No messages yet"
          description="Start a new grounded conversation below. The first question will create a chat session automatically."
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessageCard
              key={message.id}
              id={message.id}
              role={message.role}
              content={message.content}
              createdAt={message.createdAt}
              citations={message.citations}
            />
          ))}
        </div>
      )}
    </section>
  );
}
