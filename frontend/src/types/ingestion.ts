import { ChunkingStrategyType } from "./chat.js";

export interface IngestionResult {
  documentId: string;
  filename?: string;
  chunkCount: number;
  strategy: ChunkingStrategyType;
  chunkSize: number;
  chunkOverlap: number;
  timestamp: string;
}

export interface IngestionOptions {
  strategy: ChunkingStrategyType;
  chunkSize: number;
  chunkOverlap: number;
}
