import { IngestionOptions, IngestionResult } from "../types/ingestion.js";

const BASE_URL = "/api";

export class ApiService {
  public static async ingestFile(
    file: File,
    options: IngestionOptions
  ): Promise<IngestionResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chunkingStrategy", options.strategy);
    formData.append("chunkSize", options.chunkSize.toString());
    formData.append("chunkOverlap", options.chunkOverlap.toString());

    const response = await fetch(`${BASE_URL}/documents/ingest`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `File ingestion failed with status ${response.status}`
      );
    }

    const payload = await response.json();
    return payload.data;
  }

  public static async ingestRawText(
    text: string,
    filename: string,
    options: IngestionOptions
  ): Promise<IngestionResult> {
    const response = await fetch(`${BASE_URL}/documents/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        filename,
        chunkingStrategy: options.strategy,
        chunkSize: options.chunkSize,
        chunkOverlap: options.chunkOverlap,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Text ingestion failed with status ${response.status}`
      );
    }

    const payload = await response.json();
    return payload.data;
  }

  public static async checkHealth(): Promise<Record<string, unknown>> {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return response.json();
  }
}
