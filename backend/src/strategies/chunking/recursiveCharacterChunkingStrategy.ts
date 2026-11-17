import { v4 as uuidv4 } from "uuid";
import {
  ChunkingOptions,
  DocumentChunk,
  IChunkingStrategy,
} from "../../interfaces/chunkingStrategy.interface.js";

export class RecursiveCharacterChunkingStrategy implements IChunkingStrategy {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly separators: string[];

  constructor(options: ChunkingOptions, separators?: string[]) {
    this.chunkSize = Math.max(1, options.chunkSize);
    this.chunkOverlap = Math.max(0, Math.min(options.chunkOverlap, this.chunkSize - 1));
    this.separators = separators ?? ["\n\n", "\n", ". ", " ", ""];
  }

  public getStrategyName(): string {
    return "recursive";
  }

  public chunk(text: string, metadata?: Record<string, unknown>): DocumentChunk[] {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }

    const rawChunks = this.splitRecursively(trimmed, this.separators);
    const mergedChunks = this.mergeSplits(rawChunks);

    return mergedChunks.map((content, index) => ({
      id: uuidv4(),
      content,
      index,
      metadata: {
        ...metadata,
        strategy: this.getStrategyName(),
        length: content.length,
      },
    }));
  }

  private splitRecursively(text: string, separators: string[]): string[] {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    if (separators.length === 0) {
      const step = Math.max(1, this.chunkSize - this.chunkOverlap);
      const hardChunks: string[] = [];
      for (let i = 0; i < text.length; i += step) {
        hardChunks.push(text.slice(i, i + this.chunkSize));
      }
      return hardChunks;
    }

    const [currentSeparator, ...remainingSeparators] = separators;

    if (currentSeparator === "") {
      return text.split("");
    }

    if (!text.includes(currentSeparator)) {
      return this.splitRecursively(text, remainingSeparators);
    }

    const parts = text.split(currentSeparator);
    const result: string[] = [];

    for (const part of parts) {
      if (part.length <= this.chunkSize) {
        result.push(part);
      } else {
        const subParts = this.splitRecursively(part, remainingSeparators);
        result.push(...subParts);
      }
    }

    return result;
  }

  private mergeSplits(splits: string[]): string[] {
    const merged: string[] = [];
    let currentAccumulator = "";

    for (const split of splits) {
      const candidate = currentAccumulator
        ? `${currentAccumulator}\n${split}`
        : split;

      if (candidate.length <= this.chunkSize) {
        currentAccumulator = candidate;
      } else {
        if (currentAccumulator.length > 0) {
          merged.push(currentAccumulator.trim());
          const overlapStart = Math.max(
            0,
            currentAccumulator.length - this.chunkOverlap
          );
          const overlap = currentAccumulator.slice(overlapStart).trim();
          currentAccumulator = overlap ? `${overlap}\n${split}` : split;
        } else {
          merged.push(split.trim());
          currentAccumulator = "";
        }
      }
    }

    if (currentAccumulator.trim().length > 0) {
      merged.push(currentAccumulator.trim());
    }

    return merged.filter((chunk) => chunk.length > 0);
  }
}
