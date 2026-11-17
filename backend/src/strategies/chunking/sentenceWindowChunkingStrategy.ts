import { v4 as uuidv4 } from "uuid";
import {
  ChunkingOptions,
  DocumentChunk,
  IChunkingStrategy,
} from "../../interfaces/chunkingStrategy.interface.js";

export class SentenceWindowChunkingStrategy implements IChunkingStrategy {
  private readonly windowSize: number;
  private readonly windowOverlap: number;

  constructor(options: ChunkingOptions, windowSize?: number, windowOverlap?: number) {
    this.windowSize = windowSize ?? Math.max(2, Math.round(options.chunkSize / 150));
    this.windowOverlap =
      windowOverlap ??
      Math.max(1, Math.min(Math.round(options.chunkOverlap / 150), this.windowSize - 1));
  }

  public getStrategyName(): string {
    return "sentence";
  }

  public chunk(text: string, metadata?: Record<string, unknown>): DocumentChunk[] {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }

    const sentences = this.extractSentences(trimmed);
    if (sentences.length === 0) {
      return [];
    }

    const chunks: DocumentChunk[] = [];
    const step = Math.max(1, this.windowSize - this.windowOverlap);
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i += step) {
      const windowSentences = sentences.slice(i, i + this.windowSize);
      const content = windowSentences.join(" ").trim();

      if (content.length > 0) {
        chunks.push({
          id: uuidv4(),
          content,
          index: chunkIndex++,
          metadata: {
            ...metadata,
            strategy: this.getStrategyName(),
            startSentenceIndex: i,
            endSentenceIndex: Math.min(i + this.windowSize - 1, sentences.length - 1),
            totalSentences: sentences.length,
            length: content.length,
          },
        });
      }

      if (i + this.windowSize >= sentences.length) {
        break;
      }
    }

    return chunks;
  }

  private extractSentences(text: string): string[] {
    const rawMatches = text.split(/(?<=[.?!])\s+/);
    return rawMatches
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
  }
}
