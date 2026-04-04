# Research Copilot AI

Research Copilot AI is a production-style portfolio project for document intelligence workflows. The app will let users upload documents, search them semantically, ask grounded questions with citations, generate summaries, compare documents, and save findings as notes.

## Current Scope

The repository now includes a working end-to-end local MVP:

- Auth.js-protected workspace routes
- Local document upload and storage
- Text extraction and chunking
- Embeddings with OpenAI-compatible support and local fallback
- Semantic search with filters
- Grounded chat with citations
- Document summaries
- Document comparison
- Saved notes from summaries, search findings, comparison outputs, chat answers, and manual entry

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- OpenAI-compatible APIs
- pgvector

## Folder Structure

```text
app/
  (auth)/
  (app)/
components/
lib/
  auth/
  db/
  documents/
  embeddings/
  retrieval/
  llm/
  utils/
prisma/
types/
```

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template.

```bash
cp .env.example .env
```

3. Update `.env` with your local PostgreSQL connection string and API keys.

4. Generate the Prisma client.

```bash
npx prisma generate
```

5. Apply the database migration.

```bash
npx prisma migrate dev
```

6. Seed demo data.

```bash
npm run prisma:seed
```

7. Start the development server.

```bash
npm run dev
```

## Prisma Setup

The Prisma schema now includes the core Auth.js models and the MVP product models:

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Document`
- `DocumentChunk`
- `ChatSession`
- `ChatMessage`
- `Note`

## Seed Strategy

A lightweight development seed lives in [prisma/seed.ts](/c:/Users/craws/Documents/Code/Research-Copilot-AI/prisma/seed.ts). It creates:

- a demo user
- two ready documents with overlapping and distinct evidence
- seeded document chunks with embeddings
- one chat session with sample messages
- one note linked back to the assistant message

Run it with:

```bash
npm run prisma:seed
```

## Schema Notes

- Every product model is user-owned directly or indirectly to support strict data isolation.
- `Document.status` is an enum so the upload and ingestion pipeline can evolve without string drift.
- `DocumentChunk.embedding` is currently stored as `Json` to keep setup practical while the retrieval layer remains database-agnostic.
- `Note` supports both generic source tracking (`sourceType`, `sourceId`) and optional direct relations to documents or chat messages.

## Architecture Choices

- `app/` owns route-level UI and presentation concerns.
- `components/` holds reusable visual building blocks such as the navbar and page scaffolding.
- `lib/db` owns database setup so Prisma usage stays out of page components.
- `lib/auth`, `lib/documents`, `lib/embeddings`, `lib/retrieval`, `lib/llm`, and `lib/notes` keep feature logic separated by concern.
- `types/` is reserved for shared TypeScript types that should not live inside UI or service modules.

This structure keeps business logic out of the UI, makes future testing easier, and leaves a clear upgrade path for cloud storage, background jobs, and team workspaces.

## Upload Storage

Phase 4 stores uploaded files through a storage abstraction in [lib/documents/storage.ts](/c:/Users/craws/Documents/Code/Research-Copilot-AI/lib/documents/storage.ts).

- The current implementation writes files to the local filesystem under `UPLOAD_DIR`.
- Document records only persist the relative `storagePath`, not storage-specific implementation details.
- Server actions call the storage interface instead of writing files directly from page components.

That separation keeps the upload flow easy to migrate later to S3, Blob storage, or team-scoped buckets.
