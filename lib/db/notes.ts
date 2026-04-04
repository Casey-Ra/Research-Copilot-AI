import type { NoteSourceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getNotesForUser(userId: string) {
  return prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          fileName: true,
        },
      },
      chatMessage: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });
}

export async function upsertNoteForUserBySource(input: {
  userId: string;
  sourceId: string;
  sourceType: NoteSourceType;
  title: string;
  content: string;
  documentId?: string | null;
  chatMessageId?: string | null;
  tags?: Prisma.InputJsonValue;
}) {
  const existingNote = await prisma.note.findFirst({
    where: {
      userId: input.userId,
      sourceId: input.sourceId,
    },
    select: {
      id: true,
    },
  });

  if (existingNote) {
    return prisma.note.update({
      where: { id: existingNote.id },
      data: {
        title: input.title,
        content: input.content,
        sourceType: input.sourceType,
        documentId: input.documentId,
        chatMessageId: input.chatMessageId,
        tags: input.tags,
      },
    });
  }

  return prisma.note.create({
    data: {
      userId: input.userId,
      sourceId: input.sourceId,
      sourceType: input.sourceType,
      title: input.title,
      content: input.content,
      documentId: input.documentId,
      chatMessageId: input.chatMessageId,
      tags: input.tags,
    },
  });
}
