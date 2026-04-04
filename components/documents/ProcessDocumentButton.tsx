import { processDocumentAction } from "@/lib/documents/actions";

type ProcessDocumentButtonProps = {
  documentId: string;
  label?: string;
};

export function ProcessDocumentButton({
  documentId,
  label = "Process document",
}: ProcessDocumentButtonProps) {
  const action = processDocumentAction.bind(null, documentId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        {label}
      </button>
    </form>
  );
}
