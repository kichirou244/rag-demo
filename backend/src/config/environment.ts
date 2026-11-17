import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  OPENROUTER_API_KEY: z.string().default(""),
  OPENROUTER_MODEL: z.string().default("anthropic/claude-3.5-sonnet"),
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().default("gemini-3.1-flash-lite"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  LLM_PROVIDER: z.enum(["gemini", "openrouter"]).default("gemini"),
  PINECONE_API_KEY: z.string().default(""),
  PINECONE_INDEX_NAME: z.string().default("rag-index"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Environment = z.infer<typeof environmentSchema>;

export const config: Environment = environmentSchema.parse(process.env);
