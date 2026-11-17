# Production-Grade Modular RAG Base Engine

A clean, modular, and scalable Retrieval-Augmented Generation (RAG) platform built with TypeScript, Express, React, Vite, Pinecone, Google GenAI SDK, and OpenRouter.

---

## Architecture Overview

```
rag-demo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── environment.ts
│   │   ├── interfaces/
│   │   │   ├── chunkingStrategy.interface.ts
│   │   │   ├── documentLoader.interface.ts
│   │   │   ├── embeddingProvider.interface.ts
│   │   │   ├── llmProvider.interface.ts
│   │   │   ├── rag.interface.ts
│   │   │   └── vectorRepository.interface.ts
│   │   ├── strategies/
│   │   │   ├── chunking/
│   │   │   │   ├── fixedSizeChunkingStrategy.ts
│   │   │   │   ├── markdownHeaderChunkingStrategy.ts
│   │   │   │   ├── recursiveCharacterChunkingStrategy.ts
│   │   │   │   └── sentenceWindowChunkingStrategy.ts
│   │   │   └── loaders/
│   │   │       ├── markdownDocumentLoader.ts
│   │   │       └── textDocumentLoader.ts
│   │   ├── factories/
│   │   │   ├── chunkingStrategyFactory.ts
│   │   │   ├── documentLoaderFactory.ts
│   │   │   └── llmProviderFactory.ts
│   │   ├── providers/
│   │   │   ├── geminiEmbeddingProvider.ts
│   │   │   ├── geminiLLMProvider.ts
│   │   │   └── openRouterProvider.ts
│   │   ├── repositories/
│   │   │   └── pineconeRepository.ts
│   │   ├── services/
│   │   │   ├── ingestionService.ts
│   │   │   └── ragChatService.ts
│   │   ├── controllers/
│   │   │   ├── chatController.ts
│   │   │   ├── documentController.ts
│   │   │   └── healthController.ts
│   │   ├── routes/
│   │   │   ├── chatRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   ├── healthRoutes.ts
│   │   │   └── index.ts
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts
│   │   │   ├── uploadMiddleware.ts
│   │   │   └── validationMiddleware.ts
│   │   ├── utils/
│   │   │   ├── promptBuilder.ts
│   │   │   └── sseHelper.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── types/
│   │   │   ├── chat.ts
│   │   │   └── ingestion.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── chatStream.ts
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useIngestion.ts
│   │   │   └── useTheme.ts
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatMessageItem.tsx
│   │   │   │   └── CitationsAccordion.tsx
│   │   │   ├── sandbox/
│   │   │   │   ├── ChunkingControls.tsx
│   │   │   │   ├── FileUploadZone.tsx
│   │   │   │   ├── KnowledgeBasePanel.tsx
│   │   │   │   └── RawTextInputModal.tsx
│   │   │   └── common/
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Modal.tsx
│   │   ├── pages/
│   │   │   └── HomePage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── index.html
├── .env.example
└── README.md
```

---

## Design Patterns & SOLID Principles

- **Strategy Pattern:**
  - `IChunkingStrategy`: Interchangeable chunking implementations (`FixedSizeChunkingStrategy`, `RecursiveCharacterChunkingStrategy`, `MarkdownHeaderChunkingStrategy`, `SentenceWindowChunkingStrategy`).
  - `IDocumentLoader`: Extensible file parsers (`TextDocumentLoader`, `MarkdownDocumentLoader`).
  - `ILLMProvider`: Dynamic model gateways (`OpenRouterProvider`, `GeminiLLMProvider`).
  - `IEmbeddingProvider`: Dense vector generation (`GeminiEmbeddingProvider`).
- **Factory Pattern:**
  - `ChunkingStrategyFactory`: Dynamically selects chunking strategy and passes configuration.
  - `DocumentLoaderFactory`: Dispatches file parsing based on extension or mime-type.
  - `LLMProviderFactory`: Resolves LLM provider from environment defaults or per-request override.
- **Repository Pattern:**
  - `IVectorRepository`: Decouples application logic from the vector database.
  - `PineconeRepository`: Encapsulates indexing, vector querying, and document lifecycle management.
- **Adapter Pattern:**
  - `OpenRouterProvider`: Adapts the standard OpenAI client to OpenRouter endpoints.
  - `GeminiLLMProvider`: Adapts Google GenAI SDK to the `ILLMProvider` interface.
- **Dependency Injection:**
  - `IngestionService` and `RAGChatService` accept interfaces rather than concrete implementations, ensuring modular testing and decoupling.

---

## Chunking Strategies

1. **Recursive Character Chunking (`recursive`):**
   Splits text hierarchically using double newlines, single newlines, sentence terminators, and spaces, preserving semantic paragraphs and sentences within the specified chunk size and overlap.
2. **Markdown Header Hierarchy Chunking (`markdown`):**
   Parses Markdown heading markers (`#`, `##`, `###`) to create structural sections. Records the heading hierarchy in chunk metadata for contextual relevance.
3. **Fixed-Size Window Chunking (`fixed`):**
   Splits text by character windows with overlap stepping, suitable for uniform token distributions.
4. **Sentence Window Chunking (`sentence`):**
   Extracts sentences through punctuation boundaries and bundles them into sliding sentence windows with configurable overlap.

---

## API Endpoints

### 1. Ingest Document
- **Endpoint:** `POST /api/documents/ingest`
- **Content-Type:** `multipart/form-data` or `application/json`
- **Parameters:**
  - `file` (multipart upload, `.txt` or `.md`) OR `text` (raw text body)
  - `chunkingStrategy`: `"recursive"` | `"markdown"` | `"fixed"` | `"sentence"`
  - `chunkSize`: number
  - `chunkOverlap`: number
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "documentId": "c8695015-ad25-4521-8278-d42bcda9c895",
      "filename": "guide.md",
      "chunkCount": 14,
      "strategy": "recursive",
      "chunkSize": 500,
      "chunkOverlap": 50,
      "timestamp": "2026-11-17T10:20:00.000Z"
    }
  }
  ```

### 2. Chat Stream (SSE)
- **Endpoint:** `POST /api/chat/stream`
- **Content-Type:** `application/json`
- **Payload:**
  ```json
  {
    "message": "What chunking strategies are supported?",
    "topK": 4,
    "provider": "openrouter"
  }
  ```
- **Stream Sequence:**
  1. `data: {"type":"sources","sources":[...]}`
  2. `data: {"type":"token","content":"..."}`
  3. `data: {"type":"done"}`
  4. `data: [DONE]`

### 3. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-17T10:20:00.000Z",
    "configuration": {
      "nodeEnv": "development",
      "defaultLLMProvider": "openrouter",
      "openRouterConfigured": true,
      "geminiConfigured": true,
      "pineconeConfigured": true,
      "pineconeIndex": "rag-index",
      "embeddingModel": "text-embedding-004"
    }
  }
  ```

---

## Quickstart

### 1. Prerequisites
- Node.js >= 18
- Pinecone index configured with 768 dimensions (for `text-embedding-004`)

### 2. Configure Environment Variables
Copy `.env.example` in both root and backend directories:
```bash
cp .env.example backend/.env
```
Populate the required keys:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
LLM_PROVIDER=openrouter
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

### 3. Run Both Backend & Frontend (Concurrent)
```bash
npm install
npm run dev
```

Alternatively, you can run each service independently:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Navigate to `http://localhost:5173` to access the chat and ingestion sandbox.
