import { prisma } from "@/lib/db/prisma";
import { getNoteSourceLabel, getNoteTags } from "@/lib/notes/presentation";

export async function getDashboardSnapshot(userId: string) {
  const [documentCount, readyDocumentCount, failedDocumentCount, noteCount, chatSessionCount] = await Promise.all([
    prisma.document.count({
      where: { userId },
    }),
    prisma.document.count({
      where: { userId, status: "READY" },
    }),
    prisma.document.count({
      where: { userId, status: "FAILED" },
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
    failedDocumentCount,
    noteCount,
    chatSessionCount,
    processingCoverage:
      documentCount > 0 ? Math.round((readyDocumentCount / documentCount) * 100) : 0,
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
        fileName: true,
        _count: {
          select: {
            chunks: true,
            notes: true,
          },
        },
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
        tags: true,
        updatedAt: true,
        document: {
          select: {
            id: true,
            title: true,
          },
        },
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
  ]);

  const noteBreakdown = notes.reduce(
    (summary, note) => {
      const label = getNoteSourceLabel(note);

      if (label === "summary") {
        summary.summary += 1;
      }

      if (label === "search finding") {
        summary.search += 1;
      }

      if (label === "comparison note") {
        summary.compare += 1;
      }

      if (label === "chat answer") {
        summary.chat += 1;
      }

      return summary;
    },
    {
      summary: 0,
      search: 0,
      compare: 0,
      chat: 0,
    },
  );

  return {
    documents,
    notes: notes.map((note) => ({
      ...note,
      sourceLabel: getNoteSourceLabel(note),
      tags: getNoteTags(note.tags),
    })),
    chatSessions,
    noteBreakdown,
  };
}
