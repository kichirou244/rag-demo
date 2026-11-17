import {
  ChunkingOptions,
  IChunkingStrategy,
} from "../interfaces/chunkingStrategy.interface.js";
import { ChunkingStrategyType } from "../interfaces/rag.interface.js";
import { FixedSizeChunkingStrategy } from "../strategies/chunking/fixedSizeChunkingStrategy.js";
import { MarkdownHeaderChunkingStrategy } from "../strategies/chunking/markdownHeaderChunkingStrategy.js";
import { RecursiveCharacterChunkingStrategy } from "../strategies/chunking/recursiveCharacterChunkingStrategy.js";
import { SentenceWindowChunkingStrategy } from "../strategies/chunking/sentenceWindowChunkingStrategy.js";

export class ChunkingStrategyFactory {
  public static create(
    strategyType: ChunkingStrategyType = "recursive",
    options: ChunkingOptions
  ): IChunkingStrategy {
    switch (strategyType) {
      case "fixed":
        return new FixedSizeChunkingStrategy(options);
      case "recursive":
        return new RecursiveCharacterChunkingStrategy(options);
      case "markdown":
        return new MarkdownHeaderChunkingStrategy(options);
      case "sentence":
        return new SentenceWindowChunkingStrategy(options);
      default:
        return new RecursiveCharacterChunkingStrategy(options);
    }
  }
}
