import { Response } from "express";
import { ChatStreamEvent } from "../interfaces/rag.interface.js";

export class SSEHelper {
  public static initialize(res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.socket?.setNoDelay(true);
    res.flushHeaders();
  }

  public static sendEvent(res: Response, event: ChatStreamEvent): void {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
      (res as unknown as { flush: () => void }).flush();
    }
  }

  public static sendDone(res: Response): void {
    res.write(`data: [DONE]\n\n`);
    if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
      (res as unknown as { flush: () => void }).flush();
    }
    res.end();
  }

  public static sendError(res: Response, errorMessage: string): void {
    res.write(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
      (res as unknown as { flush: () => void }).flush();
    }
    res.end();
  }
}