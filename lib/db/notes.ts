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
