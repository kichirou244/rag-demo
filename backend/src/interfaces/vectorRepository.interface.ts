export interface EmbeddedChunk {
  id: string;
  documentId: string;
  text: string;
  vector: number[];
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  documentId: string;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface IVectorRepository {
  upsert(chunks: EmbeddedChunk[]): Promise<void>;
  similaritySearch(
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
