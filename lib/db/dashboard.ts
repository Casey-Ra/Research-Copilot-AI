import { prisma } from "@/lib/db/prisma";

export async function getDashboardSnapshot(userId: string) {
  const [documentCount, readyDocumentCount, noteCount, chatSessionCount] = await Promise.all([
    prisma.document.count({
      where: { userId },
    }),
    prisma.document.count({
      where: { userId, status: "READY" },
    }),
    prisma.note.count({
      where: { userId },
    }),
    prisma.chatSession.count({
      where: { userId },
    }),
  ]);

  return {
    documentCount,
    readyDocumentCount,
    noteCount,
    chatSessionCount,
  };
}

export async function getRecentWorkspaceActivity(userId: string) {
  const [documents, notes, chatSessions] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        sourceType: true,
        updatedAt: true,
      },
    }),
    prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    documents,
    notes,
    chatSessions,
  };
}
