import { Index, Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { config } from "../config/environment.js";
import {
  EmbeddedChunk,
  IVectorRepository,
  SearchResult,
} from "../interfaces/vectorRepository.interface.js";

export class PineconeRepository implements IVectorRepository {
  private readonly client: Pinecone;
  private readonly indexName: string;
  private indexInstance?: Index<RecordMetadata>;

  constructor(apiKey?: string, indexName?: string) {
    const key = apiKey || config.PINECONE_API_KEY;
    this.indexName = indexName || config.PINECONE_INDEX_NAME;
    this.client = new Pinecone({ apiKey: key });
  }

  private getIndex(): Index<RecordMetadata> {
    if (!this.indexInstance) {
      this.indexInstance = this.client.index<RecordMetadata>(this.indexName);
    }
    return this.indexInstance;
  }

  public async upsert(chunks: EmbeddedChunk[]): Promise<void> {
    if (chunks.length === 0) {
      return;
    }

    const index = this.getIndex();
    const batchSize = 50;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const slice = chunks.slice(i, i + batchSize);
      const isDocumentApi = typeof (index as unknown as { upsertDocuments?: unknown }).upsertDocuments === "function";

      if (isDocumentApi) {
        const documents = slice.map((chunk) => ({
          _id: chunk.id,
          values: chunk.vector,
          text: chunk.text,
          documentId: chunk.documentId,
          filename: (chunk.metadata?.filename as string) || chunk.documentId,
          serializedMetadata: JSON.stringify(chunk.metadata),
        }));

        await (index as unknown as {
          upsertDocuments: (opts: { documents: unknown[] }) => Promise<unknown>;
        }).upsertDocuments({ documents });
      } else {
        const records = slice.map((chunk) => ({
          id: chunk.id,
          values: chunk.vector,
          metadata: {
            documentId: chunk.documentId,
            text: chunk.text,
            serializedMetadata: JSON.stringify(chunk.metadata),
          },
        }));

        await index.upsert({ records });
      }
    }
  }

  public async similaritySearch(
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    const index = this.getIndex();
    const isDocumentApi = typeof (index as unknown as { searchDocuments?: unknown }).searchDocuments === "function";

    if (isDocumentApi) {
      try {
        const response = await (index as unknown as {
          searchDocuments: (opts: {
            topK: number;
            includeFields: string[];
            scoreBy: Array<{ type: string; field: string; values: number[] }>;
            filter?: object;
          }) => Promise<{
            matches?: Array<{
              _id: string;
              _score: number | null;
              text?: string;
              documentId?: string;
              filename?: string;
              serializedMetadata?: string;
            }>;
          }>;
        }).searchDocuments({
          topK: Math.max(1, topK),
          includeFields: ["text", "documentId", "filename", "serializedMetadata"],
          scoreBy: [
            {
              type: "dense_vector",
              field: "values",
              values: vector,
            },
          ],
          filter: filter as object | undefined,
        });

        const matches = response.matches ?? [];
        return matches.map((match) => {
          let parsedMetadata: Record<string, unknown> = {};
          if (typeof match.serializedMetadata === "string") {
            try {
              parsedMetadata = JSON.parse(match.serializedMetadata);
            } catch {
              parsedMetadata = {};
            }
          }

          return {
            id: match._id,
            documentId: match.documentId || "",
            text: match.text || "",
            score: match._score ?? 0,
            metadata: {
              ...parsedMetadata,
              filename: match.filename || parsedMetadata.filename,
            },
          };
        });
      } catch (docErr: unknown) {
        const docErrMsg = docErr instanceof Error ? docErr.message : String(docErr);
        if (!docErrMsg.includes("document schema")) {
          throw docErr;
        }
      }
    }

    const response = await index.query({
      vector,
      topK: Math.max(1, topK),
      includeMetadata: true,
      filter: filter as object | undefined,
    });

    const matches = response.matches ?? [];

    return matches.map((match) => {
      let parsedMetadata: Record<string, unknown> = {};
      const rawSerialized = match.metadata?.serializedMetadata;

      if (typeof rawSerialized === "string") {
        try {
          parsedMetadata = JSON.parse(rawSerialized);
        } catch {
          parsedMetadata = (match.metadata as Record<string, unknown>) ?? {};
        }
      } else {
        parsedMetadata = (match.metadata as Record<string, unknown>) ?? {};
      }

      return {
        id: match.id,
        documentId: (match.metadata?.documentId as string) ?? "",
        text: (match.metadata?.text as string) ?? "",
        score: match.score ?? 0,
        metadata: parsedMetadata,
      };
    });
  }

  public async deleteByDocumentId(documentId: string): Promise<void> {
    const index = this.getIndex();
    const isDocumentApi = typeof (index as unknown as { deleteDocuments?: unknown }).deleteDocuments === "function";

    if (isDocumentApi) {
      await (index as unknown as {
        deleteDocuments: (opts: { filter: object }) => Promise<unknown>;
      }).deleteDocuments({
        filter: { documentId: { $eq: documentId } },
      });
      return;
    }

    await index.deleteMany({
      filter: {
        documentId: { $eq: documentId },
      },
    });
  }
}