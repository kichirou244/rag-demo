import cors from "cors";
import express, { Express } from "express";
import { config } from "./config/environment.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { createApiRouter } from "./routes/index.js";

export const createApp = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  app.use("/api", createApiRouter());

  app.use(errorHandler);

  return app;
};
