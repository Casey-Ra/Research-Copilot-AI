# Research Copilot AI

Research Copilot AI is a production-style document intelligence app built to demonstrate a full-stack research workflow: upload source material, process it into chunks, search semantically, ask grounded questions with citations, generate summaries, compare documents, and save durable findings as notes.

## Features

- Auth.js-protected workspace routes
- Local document upload for TXT, PDF, and pasted text
- Text extraction, normalization, and chunking with overlap
- Embeddings with OpenAI-compatible support and deterministic local fallback
- Semantic search with filters and source provenance
- Grounded chat with stored sessions and clickable citations
- Document summaries with save-to-notes workflows
- Document comparison with similarities, differences, and possible contradictions
- Notes workspace with manual entry plus saved artifacts from summaries, chat, search, and compare

## Architecture

The codebase is organized so UI, data access, ingestion, retrieval, and LLM logic stay separate:

```text
app/
  (auth)/          # sign-in and public auth entry points
  (app)/           # protected workspace routes
  api/             # Auth.js route handlers
components/        # reusable UI components
lib/
  auth/            # session helpers and auth config
  chat/            # chat session/action orchestration
  db/              # Prisma client and query helpers
  documents/       # storage, parsing, chunking, summaries, compare
  embeddings/      # embedding provider abstraction
  llm/             # grounded response and summary generation
  notes/           # note actions and presentation helpers
  retrieval/       # semantic retrieval and vector utilities
  utils/           # shared utility helpers
prisma/            # schema, migrations, seed
types/             # shared TypeScript types
```

Key design choices:

- Business logic stays out of page components and lives in `lib/*` services.
- Every user-facing data query is user-scoped to enforce ownership.
- Storage is abstracted behind a local implementation so cloud storage can replace it later.
- Retrieval is isolated from Prisma and UI code, which keeps future `pgvector` adoption manageable.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template.

```bash
cp .env.example .env
```

3. Update `.env` with your local PostgreSQL connection string, Auth.js secret, and any optional API keys.

4. Generate the Prisma client.

```bash
npx prisma generate
```

5. Run the local migrations.

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

8. Open `http://localhost:3000`.

## Environment Variables

Important values from `.env.example`:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `AUTH_SECRET`: secret used by Auth.js / NextAuth
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`: optional GitHub OAuth credentials
- `OPENAI_API_KEY`: optional key for OpenAI-compatible embeddings and chat
- `OPENAI_BASE_URL`: override for a compatible provider endpoint
- `EMBEDDING_MODEL`: embedding model name
- `CHAT_MODEL`: chat/completion model name
- `EMBEDDING_DIMENSIONS`: embedding vector size used by the fallback storage format
- `CHUNK_SIZE_CHARS`: chunk size used during ingestion
- `CHUNK_OVERLAP_CHARS`: overlap size used between chunks
- `UPLOAD_DIR`: local development storage directory
- `APP_LOG_LEVEL`: logging verbosity for server-side hooks

The app still works without an external model key by using deterministic fallback behavior for embeddings, summaries, and grounded answers, which makes local setup easier.

## Data Model

The Prisma schema includes:

- Auth.js models: `User`, `Account`, `Session`, `VerificationToken`
- Product models: `Document`, `DocumentChunk`, `ChatSession`, `ChatMessage`, `Note`

Notable schema decisions:

- `Document.status` is an enum to support a clear ingestion lifecycle
- `DocumentChunk.embedding` is stored as `Json` for portability while retrieval remains abstraction-friendly
- `Note` supports both generic provenance (`sourceType`, `sourceId`) and optional direct links to documents or chat messages

## Development Notes

The seed script in [prisma/seed.ts](/c:/Users/craws/Documents/Code/Research-Copilot-AI/prisma/seed.ts) creates a local demo workspace with:

- a demo user
- multiple READY documents with overlapping and distinct evidence
- retrieval-ready chunks and embeddings
- a sample chat session
- starter notes tied back to generated artifacts

Storage is handled through [lib/documents/storage.ts](/c:/Users/craws/Documents/Code/Research-Copilot-AI/lib/documents/storage.ts), which keeps disk writes out of page components and stores only relative paths in the database.

## Tradeoffs

- `pgvector` is listed in the stack, but the current MVP keeps embeddings in JSON so local setup stays practical and the retrieval layer can evolve without locking early into a database-specific implementation.
- Document ingestion runs inline from server actions for simplicity. A production deployment would likely move parsing and embedding work into background jobs.
- PDF support prioritizes reliable text extraction and page-aware chunk metadata over pixel-perfect document reconstruction.
- The app favors maintainable server-side flows and clear ownership checks over aggressive client-side interactivity.

## Future Improvements

- Add DOCX parsing support
- Add hybrid keyword + semantic retrieval
- Add highlighted citation spans inside the document viewer
- Move ingestion and summary generation to background workers
- Add team workspaces and shared collections
- Swap local storage for S3, Blob, or another cloud storage provider
- Add analytics and an admin/debug view for ingestion and retrieval diagnostics
