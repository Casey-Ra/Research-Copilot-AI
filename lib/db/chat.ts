import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getChatSessionsForUser(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: {
        select: {
          messages: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          role: true,
          content: true,
        },
      },
    },
  });
}

export async function getChatSessionByIdForUser(chatSessionId: string, userId: string) {
  return prisma.chatSession.findFirst({
    where: {
      id: chatSessionId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createChatSessionForUser(input: {
  userId: string;
  title: string;
}) {
  return prisma.chatSession.create({
    data: {
      userId: input.userId,
      title: input.title,
    },
  });
}

export async function appendChatMessages(input: {
  chatSessionId: string;
  userMessage: string;
  assistantMessage: string;
  citations?: Prisma.InputJsonValue;
}) {
  return prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        chatSessionId: input.chatSessionId,
        role: "USER",
        content: input.userMessage,
      },
    }),
    prisma.chatMessage.create({
      data: {
        chatSessionId: input.chatSessionId,
        role: "ASSISTANT",
        content: input.assistantMessage,
        citations: input.citations,
      },
    }),
    prisma.chatSession.update({
      where: { id: input.chatSessionId },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);
}
