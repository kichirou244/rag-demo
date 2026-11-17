import { Citation } from "../types/chat.js";

export interface StreamChatParams {
  message: string;
  topK?: number;
  provider?: string;
  signal?: AbortSignal;
  onSources?: (sources: Citation[]) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export class ChatStreamService {
  public static async stream({
    message,
    topK = 4,
    provider,
    signal,
    onSources,
    onToken,
    onDone,
    onError,
  }: StreamChatParams): Promise<void> {
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          topK,
          provider,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Chat stream request failed with status ${response.status}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) {
            continue;
          }

          const rawData = trimmedLine.replace(/^data:\s*/, "").trim();
          if (rawData === "[DONE]") {
            if (onDone) {
              onDone();
            }
            return;
          }

          try {
            const parsed = JSON.parse(rawData);
            if (parsed.type === "sources" && onSources && parsed.sources) {
              onSources(parsed.sources);
            } else if (
              parsed.type === "token" &&
              onToken &&
              typeof parsed.content === "string"
            ) {
              onToken(parsed.content);
            } else if (parsed.type === "done" && onDone) {
              onDone();
            } else if (parsed.type === "error") {
              throw new Error(parsed.error || "Stream returned an error");
            }
          } catch (jsonErr) {
            if (jsonErr instanceof SyntaxError) {
              continue;
            }
            throw jsonErr;
          }
        }
      }

      if (onDone) {
        onDone();
      }
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      if (onError && err instanceof Error) {
        onError(err);
      } else if (onError) {
        onError(new Error("Unknown streaming error occurred"));
      }
    }
  }
}
