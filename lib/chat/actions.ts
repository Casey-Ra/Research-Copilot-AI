"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { appendChatMessages, createChatSessionForUser } from "@/lib/db/chat";
import { answerGroundedQuestion } from "@/lib/llm";
import { buildChatSessionTitle } from "@/lib/chat/session";
import { getErrorMessage } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

function normalizeInput(value: FormDataEntryValue | null) {
  return value?.toString().trim() ?? "";
}

function coerceFormArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => value.toString().trim())
    .filter(Boolean);
}

export async function sendChatMessageAction(formData: FormData) {
  const user = await requireUser();
  const chatSessionId = normalizeInput(formData.get("chatSessionId"));
  const question = normalizeInput(formData.get("question"));
  const selectedDocumentIds = coerceFormArray(formData, "documentId");

  if (!question) {
    const search = new URLSearchParams();

    if (chatSessionId) {
      search.set("session", chatSessionId);
    }

    for (const documentId of selectedDocumentIds) {
      search.append("documentId", documentId);
    }

    search.set("error", "Ask a question before submitting.");
    redirect(`/chat?${search.toString()}`);
  }

  const resolvedSessionId = chatSessionId
    ? chatSessionId
    : (
        await createChatSessionForUser({
          userId: user.id,
          title: buildChatSessionTitle(question),
        })
      ).id;

  logger.debug("chat.message.requested", {
    userId: user.id,
    chatSessionId: resolvedSessionId,
    selectedDocumentCount: selectedDocumentIds.length,
  });

  try {
    const groundedAnswer = await answerGroundedQuestion({
      userId: user.id,
      question,
      chatSessionId: resolvedSessionId,
      selectedDocumentIds,
    });

    await appendChatMessages({
      chatSessionId: resolvedSessionId,
      userMessage: question,
      assistantMessage: groundedAnswer.answer,
      citations: groundedAnswer.citations,
    });
    logger.info("chat.message.completed", {
      userId: user.id,
      chatSessionId: resolvedSessionId,
      citationCount: groundedAnswer.citations.length,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    const fallbackMessage = `I couldn't complete that grounded answer because: ${message}`;
    logger.error("chat.message.failed", {
      userId: user.id,
      chatSessionId: resolvedSessionId,
      message,
    });

    await appendChatMessages({
      chatSessionId: resolvedSessionId,
      userMessage: question,
      assistantMessage: fallbackMessage,
      citations: [],
    });
  }

  revalidatePath("/chat");

  const search = new URLSearchParams();
  search.set("session", resolvedSessionId);

  for (const documentId of selectedDocumentIds) {
    search.append("documentId", documentId);
  }

  redirect(`/chat?${search.toString()}`);
}
