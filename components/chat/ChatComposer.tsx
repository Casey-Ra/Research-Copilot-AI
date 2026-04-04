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
    <form action={sendChatMessageAction} className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      {activeSessionId ? <input type="hidden" name="chatSessionId" value={activeSessionId} /> : null}

      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Grounded prompt
        </p>
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
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          Answers are grounded in retrieved chunks with numbered citations
        </p>
        <button
          type="submit"
          className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Send question
        </button>
      </div>
    </form>
  );
}
