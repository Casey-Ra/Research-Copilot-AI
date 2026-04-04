import { CitationList } from "@/components/chat/CitationList";
import { SaveChatNoteButton } from "@/components/chat/SaveChatNoteButton";
import { formatShortDateTime } from "@/lib/utils/format";
import type { JsonCitation } from "@/types/database";
import { cn } from "@/lib/utils/cn";

type ChatMessageCardProps = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: Date;
  citations?: JsonCitation[];
};

export function ChatMessageCard({
  id,
  role,
  content,
  createdAt,
  citations = [],
}: ChatMessageCardProps) {
  const isAssistant = role === "ASSISTANT";

  return (
    <article
      className={cn(
        "rounded-[1.75rem] border p-6 shadow-sm",
        isAssistant ? "border-cyan-200 bg-cyan-50/40" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          {isAssistant ? "Assistant" : role === "SYSTEM" ? "System" : "You"}
        </p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          {formatShortDateTime(createdAt)}
        </p>
      </div>

      <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">{content}</div>

      {isAssistant ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <SaveChatNoteButton messageId={id} />
        </div>
      ) : null}

      {isAssistant ? <CitationList citations={citations} /> : null}
    </article>
  );
}
