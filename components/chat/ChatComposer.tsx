import { sendChatMessageAction } from "@/lib/chat/actions";
import { ChatDocumentScope } from "@/components/chat/ChatDocumentScope";

type ChatComposerProps = {
  activeSessionId?: string;
  selectedDocumentIds: string[];
  documents: {
    id: string;
    title: string;
    fileName: string;
    chunkCount: number;
  }[];
};

export function ChatComposer({
  activeSessionId,
  selectedDocumentIds,
  documents,
}: ChatComposerProps) {
  return (
    <form action={sendChatMessageAction} className="ui-panel space-y-6 p-6">
      {activeSessionId ? <input type="hidden" name="chatSessionId" value={activeSessionId} /> : null}

      <div className="space-y-2">
        <p className="ui-kicker">Grounded prompt</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Ask a question against retrieved evidence
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          Each answer is generated from the top retrieved chunks only and stored with citation
          metadata on the assistant message.
        </p>
      </div>

      <ChatDocumentScope documents={documents} selectedDocumentIds={selectedDocumentIds} />

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Question
        <textarea
          name="question"
          rows={5}
          placeholder="What are the most important claims in these documents, and what evidence supports them?"
          className="ui-field min-h-[10rem] resize-y"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          Answers are grounded in retrieved chunks with numbered citations
        </p>
        <button
          type="submit"
          className="ui-btn-primary"
        >
          Send question
        </button>
      </div>
    </form>
  );
}
