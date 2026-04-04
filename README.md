# Research Copilot AI

Research Copilot AI is a production-style portfolio project for document intelligence workflows. The app will let users upload documents, search them semantically, ask grounded questions with citations, generate summaries, compare documents, and save findings as notes.

## Phase 0 Scope

This repository currently contains the clean foundation for the product:

- Next.js App Router with TypeScript
- Tailwind CSS project styling
- Shared layout and navigation
- Placeholder routes for the core app sections
- Prisma and PostgreSQL scaffolding
- Service boundaries for auth, documents, embeddings, retrieval, and LLM orchestration
- Local environment variable template

Advanced product logic is intentionally deferred until later phases.

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
  dashboard/
  documents/
  search/
  chat/
  notes/
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

5. Start the development server.

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
- one ready document
- two document chunks
- one chat session with sample messages
- one note linked back to the assistant message

Run it with:

```bash
npm run prisma:seed
```

## Schema Notes

- Every product model is user-owned directly or indirectly to support strict data isolation.
- `Document.status` is an enum so the upload and ingestion pipeline can evolve without string drift.
- `DocumentChunk.embedding` is currently stored as `Json` to keep setup practical before the vector-search phase.
- `Note` supports both generic source tracking (`sourceType`, `sourceId`) and optional direct relations to documents or chat messages.

## Architecture Choices

- `app/` owns route-level UI and presentation concerns.
- `components/` holds reusable visual building blocks such as the navbar and page scaffolding.
- `lib/db` owns database setup so Prisma usage stays out of page components.
- `lib/auth`, `lib/documents`, `lib/embeddings`, `lib/retrieval`, and `lib/llm` define clear service boundaries before feature logic is added.
- `types/` is reserved for shared TypeScript types that should not live inside UI or service modules.

This structure keeps business logic out of the UI, makes future testing easier, and leaves a clear upgrade path for cloud storage, background jobs, and team workspaces.

## Next Recommended Phase

Phase 1 adds Auth.js / NextAuth, protected routes, an auth-aware shell, and session helpers on top of this foundation.
