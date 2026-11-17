import { SearchResult } from "./vectorRepository.interface.js";

export type ChunkingStrategyType = "fixed" | "recursive" | "markdown" | "sentence";
export type LLMProviderType = "openrouter" | "gemini";

export interface IngestionResult {
  documentId: string;
  filename?: string;
  chunkCount: number;
  strategy: ChunkingStrategyType;
  chunkSize: number;
  chunkOverlap: number;
  timestamp: string;
}

export interface IngestionInput {
  text?: string;
  buffer?: Buffer;
  filename?: string;
  strategy?: ChunkingStrategyType;
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatStreamSourcePayload {
  type: "sources";
  sources: SearchResult[];
}

export interface ChatStreamTokenPayload {
  type: "token";
  content: string;
}

export interface ChatStreamDonePayload {
  type: "done";
}

export interface ChatStreamErrorPayload {
  type: "error";
  error: string;
}

export type ChatStreamEvent =
  | ChatStreamSourcePayload
  | ChatStreamTokenPayload
  | ChatStreamDonePayload
  | ChatStreamErrorPayload;
