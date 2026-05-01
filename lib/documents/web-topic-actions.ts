"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createDocumentAndIngestForUser } from "@/lib/documents/create-and-ingest";
import { buildWebSourcePlainText, webSourceTextToUploadBuffer } from "@/lib/documents/web-source-body";
import { DEFAULT_TEXT_FILE_TYPE } from "@/lib/documents/constants";
import { requireUser } from "@/lib/auth/session";
import { collectFreeWebHits, normalizeWebTopic } from "@/lib/web-search/collect-hits";
import { enrichWebHitBody } from "@/lib/web-search/enrich-hit";
import { getErrorMessage } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export type ImportWebTopicActionState = {
  error?: string;
  success?: string;
};

function webSourceFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const base = slug.length > 0 ? slug : "web-source";
  return `${base}-${randomUUID().slice(0, 8)}.txt`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function importWebTopicAction(
  _previous: ImportWebTopicActionState,
  formData: FormData,
): Promise<ImportWebTopicActionState> {
  const user = await requireUser();
  const topic = normalizeWebTopic(formData.get("webTopic")?.toString() ?? "");

  if (!topic) {
    return { error: "Enter a topic (a few words are enough) before importing web sources." };
  }

  let hits: Awaited<ReturnType<typeof collectFreeWebHits>>;
  try {
    hits = await collectFreeWebHits(topic);
  } catch (error) {
    logger.error("web-topic.search.failed", { userId: user.id, message: getErrorMessage(error) });
    return {
      error: `Web search failed: ${getErrorMessage(error, "Unknown error.")}`,
    };
  }

  if (hits.length === 0) {
    return {
      error:
        "No web results were returned. Try a broader topic, check your network connection, or try again later.",
    };
  }

  const imported: string[] = [];
  const failures: string[] = [];

  for (let i = 0; i < hits.length; i += 1) {
    const hit = hits[i]!;
    let enriched: string | undefined;
    try {
      enriched = await enrichWebHitBody(hit);
    } catch {
      enriched = undefined;
    }

    const plain = buildWebSourcePlainText(topic, hit, enriched);
    const bytes = webSourceTextToUploadBuffer(plain);
    const fileName = webSourceFileName(hit.title);
    const docTitle =
      hit.title.length > 180 ? `${hit.title.slice(0, 177).trimEnd()}…` : hit.title;

    try {
      const result = await createDocumentAndIngestForUser({
        userId: user.id,
        title: docTitle,
        fileName,
        fileType: DEFAULT_TEXT_FILE_TYPE,
        bytes,
        metadata: {
          sourceKind: "web-topic",
          webTopic: topic,
          webSourceUrl: hit.url,
          webProvider: hit.provider,
          webSearchImportedAt: new Date().toISOString(),
        },
      });
      imported.push(result.documentId);
      logger.info("web-topic.source.imported", {
        userId: user.id,
        documentId: result.documentId,
        chunkCount: result.chunkCount,
        provider: hit.provider,
      });
    } catch (error) {
      failures.push(hit.title);
      logger.error("web-topic.source.failed", {
        userId: user.id,
        url: hit.url,
        message: getErrorMessage(error),
      });
    }

    if (i < hits.length - 1) {
      await sleep(120);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  revalidatePath("/documents");

  if (imported.length === 0) {
    return {
      error: `Could not import any sources (${failures.length} failed). Check the database and logs, then try again.`,
    };
  }

  const success =
    failures.length === 0
      ? `Imported ${imported.length} source${imported.length === 1 ? "" : "s"} from Wikipedia and DuckDuckGo for “${topic}”. Open Documents to review and search them.`
      : `Imported ${imported.length} source${imported.length === 1 ? "" : "s"}; ${failures.length} could not be processed. Open Documents for the ones that succeeded.`;

  return { success };
}
