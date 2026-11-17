import { v4 as uuidv4 } from "uuid";
import {
  ChunkingOptions,
  DocumentChunk,
  IChunkingStrategy,
} from "../../interfaces/chunkingStrategy.interface.js";

export class FixedSizeChunkingStrategy implements IChunkingStrategy {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(options: ChunkingOptions) {
    this.chunkSize = Math.max(1, options.chunkSize);
    this.chunkOverlap = Math.max(0, Math.min(options.chunkOverlap, this.chunkSize - 1));
  }

  public getStrategyName(): string {
    return "fixed";
  }

  public chunk(text: string, metadata?: Record<string, unknown>): DocumentChunk[] {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }

    const chunks: DocumentChunk[] = [];
    const step = Math.max(1, this.chunkSize - this.chunkOverlap);
    let index = 0;

    for (let start = 0; start < trimmed.length; start += step) {
      const end = Math.min(start + this.chunkSize, trimmed.length);
      const slice = trimmed.slice(start, end).trim();

      if (slice.length > 0) {
        chunks.push({
          id: uuidv4(),
          content: slice,
          index,
          metadata: {
            ...metadata,
            strategy: this.getStrategyName(),
            startOffset: start,
            endOffset: end,
            length: slice.length,
          },
        });
        index++;
      }

      if (end >= trimmed.length) {
        break;
      }
    }

    return chunks;
  }
}
