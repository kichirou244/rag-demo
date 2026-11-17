import { Request, Response } from "express";
import { config } from "../config/environment.js";

export class HealthController {
  public check = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      configuration: {
        nodeEnv: config.NODE_ENV,
        defaultLLMProvider: config.LLM_PROVIDER,
        openRouterConfigured: Boolean(config.OPENROUTER_API_KEY),
        geminiConfigured: Boolean(config.GEMINI_API_KEY),
        pineconeConfigured: Boolean(config.PINECONE_API_KEY),
        pineconeIndex: config.PINECONE_INDEX_NAME,
        embeddingModel: config.GEMINI_EMBEDDING_MODEL,
      },
    });
  };
}
