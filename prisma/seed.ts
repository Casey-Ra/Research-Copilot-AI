import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ChatRole, DocumentStatus, NoteSourceType } from "@prisma/client";
import { generateEmbeddings } from "@/lib/embeddings";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured for Prisma seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@researchcopilot.local" },
    update: {
      name: "Demo Researcher",
    },
    create: {
      email: "demo@researchcopilot.local",
      name: "Demo Researcher",
    },
  });

  const document = await prisma.document.upsert({
    where: { id: "demo-document" },
    update: {
      title: "AI Safety Notes",
      status: DocumentStatus.READY,
      userId: demoUser.id,
    },
    create: {
      id: "demo-document",
      userId: demoUser.id,
      title: "AI Safety Notes",
      fileName: "ai-safety-notes.txt",
      fileType: "text/plain",
      storagePath: "storage/uploads/ai-safety-notes.txt",
      fileSizeBytes: 2048,
      status: DocumentStatus.READY,
      extractedText:
        "Research Copilot AI can help analysts review long-form documents, extract key claims, and preserve citations for follow-up work.",
      metadata: {
        source: "seed",
        embeddingProvider: "local-fallback",
      },
    },
  });

  const comparisonDocument = await prisma.document.upsert({
    where: { id: "demo-document-2" },
    update: {
      title: "Launch Risk Review",
      status: DocumentStatus.READY,
      userId: demoUser.id,
    },
    create: {
      id: "demo-document-2",
      userId: demoUser.id,
      title: "Launch Risk Review",
      fileName: "launch-risk-review.txt",
      fileType: "text/plain",
      storagePath: "storage/uploads/launch-risk-review.txt",
      fileSizeBytes: 2336,
      status: DocumentStatus.READY,
      extractedText:
        "The launch review recommends grounded answers with citations for critical decisions, but it focuses more heavily on rollout risks, escalation paths, and follow-up actions after release.",
      metadata: {
        source: "seed",
        embeddingProvider: "local-fallback",
      },
    },
  });

  const seedChunks = [
    {
      chunkIndex: 0,
      text: "Research Copilot AI can help analysts review long-form documents.",
      startOffset: 0,
      endOffset: 67,
    },
    {
      chunkIndex: 1,
      text: "It is designed to support grounded answers with citations and reusable notes.",
      startOffset: 68,
      endOffset: 146,
    },
  ];

  const comparisonChunks = [
    {
      chunkIndex: 0,
      text: "The launch review recommends grounded answers with citations for critical decisions.",
      startOffset: 0,
      endOffset: 83,
    },
    {
      chunkIndex: 1,
      text: "It focuses more heavily on rollout risks, escalation paths, and follow-up actions after release.",
      startOffset: 84,
      endOffset: 183,
    },
  ];

  const embeddings = await generateEmbeddings({
    texts: [...seedChunks.map((chunk) => chunk.text), ...comparisonChunks.map((chunk) => chunk.text)],
    userId: demoUser.id,
  });

  await prisma.documentChunk.deleteMany({
    where: {
      documentId: document.id,
    },
  });

  await prisma.documentChunk.createMany({
    data: seedChunks.map((chunk, index) => ({
      documentId: document.id,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      startOffset: chunk.startOffset,
      endOffset: chunk.endOffset,
      embedding: embeddings.vectors[index],
      embeddingModel: embeddings.model,
    })),
  });

  await prisma.documentChunk.deleteMany({
    where: {
      documentId: comparisonDocument.id,
    },
  });

  await prisma.documentChunk.createMany({
    data: comparisonChunks.map((chunk, index) => ({
      documentId: comparisonDocument.id,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      startOffset: chunk.startOffset,
      endOffset: chunk.endOffset,
      embedding: embeddings.vectors[seedChunks.length + index],
      embeddingModel: embeddings.model,
    })),
  });

  const chatSession = await prisma.chatSession.upsert({
    where: { id: "demo-chat-session" },
    update: {
      userId: demoUser.id,
      title: "AI safety overview",
    },
    create: {
      id: "demo-chat-session",
      userId: demoUser.id,
      title: "AI safety overview",
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        id: "demo-chat-message-user",
        chatSessionId: chatSession.id,
        role: ChatRole.USER,
        content: "What is the purpose of Research Copilot AI?",
      },
      {
        id: "demo-chat-message-assistant",
        chatSessionId: chatSession.id,
        role: ChatRole.ASSISTANT,
        content:
          "Its purpose is to help users analyze documents with grounded answers, retrieval, and saved notes.",
        citations: [
          {
            documentId: document.id,
            chunkIndex: 0,
          },
        ],
      },
    ],
    skipDuplicates: true,
  });

  await prisma.note.upsert({
    where: { id: "demo-note" },
    update: {
      userId: demoUser.id,
      title: "Seeded note",
    },
    create: {
      id: "demo-note",
      userId: demoUser.id,
      documentId: document.id,
      chatMessageId: "demo-chat-message-assistant",
      title: "Seeded note",
      content: "Grounded notes should remain tied to source evidence wherever possible.",
      sourceType: NoteSourceType.CHAT_MESSAGE,
      sourceId: "demo-chat-message-assistant",
      tags: ["seed", "grounded-ai"],
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
