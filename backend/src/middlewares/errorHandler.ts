import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const errorMessage =
    err instanceof Error ? err.message : "Đã xảy ra lỗi máy chủ nội bộ";

  res.status(500).json({
    status: "error",
    message: errorMessage,
    timestamp: new Date().toISOString(),
  });
};
