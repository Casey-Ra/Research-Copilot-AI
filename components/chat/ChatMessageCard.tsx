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
        "rounded-[1.6rem] border p-6 shadow-[0_22px_56px_-40px_rgba(16,35,63,0.4)]",
        isAssistant
          ? "border-[rgba(47,103,218,0.18)] bg-[linear-gradient(180deg,_rgba(243,247,255,0.95),_rgba(232,240,255,0.7))]"
          : "border-[rgba(136,155,194,0.22)] bg-white/86",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="ui-kicker">
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
