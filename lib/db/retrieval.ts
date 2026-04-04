import { prisma } from "@/lib/db/prisma";

export async function getReadyDocumentsForUser(userId: string) {
  return prisma.document.findMany({
    where: {
      userId,
      status: "READY",
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      fileName: true,
      fileType: true,
      updatedAt: true,
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });
}
