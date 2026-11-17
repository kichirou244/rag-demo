import { OpenRouter } from "@openrouter/sdk";
import { config } from "../config/environment.js";
import { ILLMProvider } from "../interfaces/llmProvider.interface.js";

export class OpenRouterProvider implements ILLMProvider {
  private readonly client: OpenRouter;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || config.OPENROUTER_API_KEY;
    this.modelName = modelName || config.OPENROUTER_MODEL;
    this.client = new OpenRouter({
      apiKey: key,
    });
  }

  public getProviderName(): string {
    return "openrouter";
  }

  public async generateResponse(
    prompt: string,
    context: string
  ): Promise<string> {
    const response = await this.client.chat.send({
      chatRequest: {
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: context,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .map((item) => (typeof item === "object" && item && "text" in item ? String(item.text) : ""))
        .join("");
    }
    return "";
  }

  public async streamResponse(
    prompt: string,
    context: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const stream = await this.client.chat.send({
      chatRequest: {
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: context,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        stream: true,
      },
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (typeof content === "string" && content.length > 0) {
        onChunk(content);
      }
    }
  }
}