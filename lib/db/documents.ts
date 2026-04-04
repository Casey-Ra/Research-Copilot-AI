import { prisma } from "@/lib/db/prisma";

export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          chunks: true,
          notes: true,
        },
      },
    },
  });
}

export async function getDocumentByIdForUser(documentId: string, userId: string) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
    include: {
      chunks: {
        orderBy: { chunkIndex: "asc" },
      },
      notes: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}
