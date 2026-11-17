import { Request, Response, NextFunction } from "express";
import { IngestionService } from "../services/ingestionService.js";
import { ChunkingStrategyType } from "../interfaces/rag.interface.js";

export class DocumentController {
  constructor(private readonly ingestionService: IngestionService) {}

  public ingest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file;
      const text = req.body.text as string | undefined;
      const strategy = req.body.chunkingStrategy as ChunkingStrategyType | undefined;
      const chunkSize = req.body.chunkSize
        ? parseInt(req.body.chunkSize, 10)
        : undefined;
      const chunkOverlap = req.body.chunkOverlap
        ? parseInt(req.body.chunkOverlap, 10)
        : undefined;

      let customMetadata: Record<string, unknown> = {};
      if (req.body.metadata) {
        if (typeof req.body.metadata === "string") {
          try {
            customMetadata = JSON.parse(req.body.metadata);
          } catch {
            customMetadata = {};
          }
        } else if (typeof req.body.metadata === "object") {
          customMetadata = req.body.metadata;
        }
      }

      if (!file && !text) {
        res.status(400).json({
          status: "error",
          message: "Cần cung cấp file tải lên hoặc nội dung văn bản",
        });
        return;
      }

      const result = await this.ingestionService.ingest({
        buffer: file?.buffer,
        filename: file?.originalname ?? req.body.filename ?? "pasted-content.txt",
        text,
        strategy,
        chunkSize,
        chunkOverlap,
        metadata: customMetadata,
      });

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
