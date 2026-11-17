import { useState } from "react";
import { ApiService } from "../services/api.js";
import { ChunkingStrategyType, LLMProviderType } from "../types/chat.js";
import { IngestionOptions, IngestionResult } from "../types/ingestion.js";

export const useIngestion = () => {
  const [strategy, setStrategy] = useState<ChunkingStrategyType>("recursive");
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [topK, setTopK] = useState<number>(4);
  const [provider, setProvider] = useState<LLMProviderType>("openrouter");

  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<IngestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<IngestionResult[]>([]);

  const options: IngestionOptions = {
    strategy,
    chunkSize,
    chunkOverlap,
  };

  const ingestFile = async (file: File): Promise<IngestionResult | null> => {
    setIsIngesting(true);
    setError(null);

    try {
      const result = await ApiService.ingestFile(file, options);
      setLastResult(result);
      setHistory((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to ingest document file";
      setError(message);
      return null;
    } finally {
      setIsIngesting(false);
    }
  };

  const ingestRawText = async (
    text: string,
    filename: string = "raw-text.txt"
  ): Promise<IngestionResult | null> => {
    setIsIngesting(true);
    setError(null);

    try {
      const result = await ApiService.ingestRawText(text, filename, options);
      setLastResult(result);
      setHistory((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to ingest raw text";
      setError(message);
      return null;
    } finally {
      setIsIngesting(false);
    }
  };

  const resetStatus = () => {
    setError(null);
    setLastResult(null);
  };

  return {
    strategy,
    setStrategy,
    chunkSize,
    setChunkSize,
    chunkOverlap,
    setChunkOverlap,
    topK,
    setTopK,
    provider,
    setProvider,
    isIngesting,
    lastResult,
    error,
    history,
    ingestFile,
    ingestRawText,
    resetStatus,
  };
};
