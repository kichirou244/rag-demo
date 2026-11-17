import { GoogleGenAI } from "@google/genai";
import { config } from "../config/environment.js";
import { ILLMProvider } from "../interfaces/llmProvider.interface.js";

export class GeminiLLMProvider implements ILLMProvider {
  private readonly client: GoogleGenAI;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || config.GEMINI_API_KEY;
    this.modelName = modelName || config.GEMINI_MODEL;
    this.client = new GoogleGenAI({ apiKey: key });
  }

  public getProviderName(): string {
    return "gemini";
  }

  public async generateResponse(prompt: string, context: string): Promise<string> {
    const contents = `${context}\n\nCâu hỏi của người dùng:\n${prompt}`;
    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents,
    });
    return response.text ?? "";
  }

  public async streamResponse(
    prompt: string,
    context: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const contents = `${context}\n\nCâu hỏi của người dùng:\n${prompt}`;
    const responseStream = await this.client.models.generateContentStream({
      model: this.modelName,
      contents,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  }
}
