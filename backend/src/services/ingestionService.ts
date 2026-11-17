import { v4 as uuidv4 } from "uuid";
import { DocumentLoaderFactory } from "../factories/documentLoaderFactory.js";
import { ChunkingStrategyFactory } from "../factories/chunkingStrategyFactory.js";
import { IEmbeddingProvider } from "../interfaces/embeddingProvider.interface.js";
import {
  ChunkingStrategyType,
  IngestionInput,
  IngestionResult,
} from "../interfaces/rag.interface.js";
import {
  EmbeddedChunk,
  IVectorRepository,
} from "../interfaces/vectorRepository.interface.js";

export class IngestionService {
  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly vectorRepository: IVectorRepository
  ) {}

  public async ingest(input: IngestionInput): Promise<IngestionResult> {
    const rawText = await this.extractText(input);
    const trimmed = rawText.trim();

    if (!trimmed) {
      throw new Error("Document content is empty after extraction");
    }

    const documentId = uuidv4();
    const strategyName: ChunkingStrategyType = input.strategy ?? "recursive";
    const chunkSize = input.chunkSize ?? 500;
    const chunkOverlap = input.chunkOverlap ?? 50;

    const strategy = ChunkingStrategyFactory.create(strategyName, {
      chunkSize,
      chunkOverlap,
      metadata: input.metadata,
    });

    const chunks = strategy.chunk(trimmed, {
      documentId,
      filename: input.filename,
      ...input.metadata,
    });

    if (chunks.length === 0) {
      throw new Error("No chunks generated from document text");
    }

    const contents = chunks.map((chunk) => chunk.content);
    const vectors = await this.embeddingProvider.embedBatch(contents);

    const embeddedChunks: EmbeddedChunk[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      documentId,
      text: chunk.content,
      vector: vectors[index],
      metadata: chunk.metadata,
    }));

    await this.vectorRepository.upsert(embeddedChunks);

    return {
      documentId,
      filename: input.filename,
      chunkCount: embeddedChunks.length,
      strategy: strategyName,
      chunkSize,
      chunkOverlap,
      timestamp: new Date().toISOString(),
    };
  }

  private async extractText(input: IngestionInput): Promise<string> {
    if (input.buffer && input.filename) {
      const loader = DocumentLoaderFactory.getLoader(input.filename);
      return loader.load(input.buffer, input.filename);
    }

    if (input.text) {
      return input.text;
    }

    throw new Error("Neither file buffer nor text content was provided for ingestion");
  }
}
