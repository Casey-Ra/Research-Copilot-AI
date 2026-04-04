import { deleteDocumentAction } from "@/lib/documents/actions";

type DeleteDocumentButtonProps = {
  documentId: string;
};

export function DeleteDocumentButton({ documentId }: DeleteDocumentButtonProps) {
  const action = deleteDocumentAction.bind(null, documentId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Delete document
      </button>
    </form>
  );
}
