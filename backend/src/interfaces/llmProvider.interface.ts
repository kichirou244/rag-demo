export interface ILLMProvider {
  generateResponse(prompt: string, context: string): Promise<string>;
  streamResponse(
    prompt: string,
    context: string,
    onChunk: (chunk: string) => void
  ): Promise<void>;
  getProviderName(): string;
}
