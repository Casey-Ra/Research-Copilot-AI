"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";

export type CreateDocumentActionState = {
  error?: string;
};

function normalizeInput(value: FormDataEntryValue | null) {
  return value?.toString().trim() ?? "";
}

export async function createDocumentAction(
  _previousState: CreateDocumentActionState,
  formData: FormData,
): Promise<CreateDocumentActionState> {
  const user = await requireUser();

  const title = normalizeInput(formData.get("title"));
  const fileName = normalizeInput(formData.get("fileName"));
  const fileType = normalizeInput(formData.get("fileType"));

  if (!title || !fileName || !fileType) {
    return { error: "Title, file name, and file type are all required." };
  }

  await prisma.document.create({
    data: {
      userId: user.id,
      title,
      fileName,
      fileType,
      status: "UPLOADED",
      metadata: {
        createdFrom: "phase-3-draft-form",
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/documents");
  return {};
}

export async function deleteDocumentAction(documentId: string) {
  const user = await requireUser();

  await prisma.document.deleteMany({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/documents");
  redirect("/documents");
}
