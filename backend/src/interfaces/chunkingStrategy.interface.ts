export interface DocumentChunk {
  id: string;
  content: string;
  index: number;
  metadata: Record<string, unknown>;
}

export interface ChunkingOptions {
  chunkSize: number;
  chunkOverlap: number;
  metadata?: Record<string, unknown>;
}

export interface IChunkingStrategy {
  chunk(text: string, metadata?: Record<string, unknown>): DocumentChunk[];
  getStrategyName(): string;
}
