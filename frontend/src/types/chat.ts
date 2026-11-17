export type ChunkingStrategyType = "fixed" | "recursive" | "markdown" | "sentence";
export type LLMProviderType = "openrouter" | "gemini";

export interface Citation {
  id: string;
  documentId: string;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Citation[];
  isStreaming?: boolean;
  error?: string;
  timestamp: string;
}

export interface ChatStreamEventData {
  type: "sources" | "token" | "done" | "error";
  sources?: Citation[];
  content?: string;
  error?: string;
}
