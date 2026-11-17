import { GoogleGenAI } from "@google/genai";
import { config } from "../config/environment.js";
import { IEmbeddingProvider } from "../interfaces/embeddingProvider.interface.js";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  private readonly client: GoogleGenAI;
  private readonly modelName: string;
  private readonly dimensions: number = 768;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || config.GEMINI_API_KEY;
    this.modelName = modelName || config.GEMINI_EMBEDDING_MODEL;
    this.client = new GoogleGenAI({ apiKey: key });
  }

  public getDimensions(): number {
    return this.dimensions;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 5
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const isRateLimit =
          errMessage.includes("429") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("quota");

        if (isRateLimit && attempt < maxRetries) {
          const match = errMessage.match(/retry in ([0-9.]+)s/i);
          const waitSeconds = match
            ? Math.ceil(parseFloat(match[1])) + 2
            : (attempt + 1) * 8;
          process.stdout.write(
            `\n[GEMINI RATE LIMIT] Chạm hạn mức gói Free Tier. Đợi ${waitSeconds} giây để tự động thử lại (lần ${
              attempt + 1
            }/${maxRetries})...\n`
          );
          await sleep(waitSeconds * 1000);
          continue;
        }
        throw err;
      }
    }
    throw new Error("Đã vượt quá số lần thử lại tối đa cho yêu cầu embedding");
  }

  public async embedText(text: string): Promise<number[]> {
    return this.executeWithRetry(async () => {
      const response = await this.client.models.embedContent({
        model: this.modelName,
        contents: [text],
        config: {
          outputDimensionality: this.dimensions,
        },
      });

      const values = response.embeddings?.[0]?.values;
      if (!values || values.length === 0) {
        throw new Error(
          `Không thể tạo vector nhúng cho văn bản với mô hình ${this.modelName}`
        );
      }

      return values;
    });
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const batchSize = 10;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(texts.length / batchSize);

      process.stdout.write(
        `  -> Tiến trình Embedding: Đợt ${batchIndex}/${totalBatches} (${batch.length} phân đoạn)...\r`
      );

      const response = await this.executeWithRetry(async () => {
        return await this.client.models.embedContent({
          model: this.modelName,
          contents: batch,
          config: {
            outputDimensionality: this.dimensions,
          },
        });
      });

      if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error(
          `Không thể tạo batch embeddings tại vị trí ${i}`
        );
      }

      for (const item of response.embeddings) {
        if (!item.values) {
          throw new Error(
            `Thiếu dữ liệu embedding trong phản hồi tại vị trí ${i}`
          );
        }
        results.push(item.values);
      }

      if (i + batchSize < texts.length) {
        await sleep(1000);
      }
    }

    process.stdout.write("\n");
    return results;
  }
}