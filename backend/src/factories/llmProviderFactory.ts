import { config } from "../config/environment.js";
import { ILLMProvider } from "../interfaces/llmProvider.interface.js";
import { LLMProviderType } from "../interfaces/rag.interface.js";
import { GeminiLLMProvider } from "../providers/geminiLLMProvider.js";
import { OpenRouterProvider } from "../providers/openRouterProvider.js";

export class LLMProviderFactory {
  public static create(providerOverride?: string): ILLMProvider {
    const selected = (providerOverride || config.LLM_PROVIDER).toLowerCase() as LLMProviderType;

    switch (selected) {
      case "gemini":
        return new GeminiLLMProvider();
      case "openrouter":
        return new OpenRouterProvider();
      default:
        return new OpenRouterProvider();
    }
  }
}
