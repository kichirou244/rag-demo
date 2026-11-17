import { Request, Response } from "express";
import { RAGChatService } from "../services/ragChatService.js";
import { SSEHelper } from "../utils/sseHelper.js";

export class ChatController {
  constructor(private readonly chatService: RAGChatService) {}

  public stream = async (req: Request, res: Response): Promise<void> => {
    const { message, topK, provider } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({
        status: "error",
        message: "Nội dung câu hỏi là bắt buộc",
      });
      return;
    }

    SSEHelper.initialize(res);

    let isAborted = false;
    res.on("close", () => {
      if (!res.writableEnded) {
        isAborted = true;
      }
    });

    try {
      await this.chatService.streamChat(
        message,
        topK ? Number(topK) : 5,
        provider,
        (sources) => {
          if (!isAborted) {
            SSEHelper.sendEvent(res, {
              type: "sources",
              sources,
            });
          }
        },
        (chunk) => {
          if (!isAborted) {
            SSEHelper.sendEvent(res, {
              type: "token",
              content: chunk,
            });
          }
        }
      );

      if (!isAborted && !res.writableEnded) {
        SSEHelper.sendEvent(res, { type: "done" });
        SSEHelper.sendDone(res);
      }
    } catch (error) {
      if (!isAborted && !res.writableEnded) {
        const errorMessage =
          error instanceof Error ? error.message : "Lỗi trong quá trình stream phản hồi";
        SSEHelper.sendError(res, errorMessage);
      }
    }
  };
}
