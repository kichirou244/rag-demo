import { Router } from "express";
import { ChatController } from "../controllers/chatController.js";
import { DocumentController } from "../controllers/documentController.js";
import { HealthController } from "../controllers/healthController.js";
import { GeminiEmbeddingProvider } from "../providers/geminiEmbeddingProvider.js";
import { PineconeRepository } from "../repositories/pineconeRepository.js";
import { IngestionService } from "../services/ingestionService.js";
import { RAGChatService } from "../services/ragChatService.js";
import { createChatRouter } from "./chatRoutes.js";
import { createDocumentRouter } from "./documentRoutes.js";
import { createHealthRouter } from "./healthRoutes.js";

export const createApiRouter = (): Router => {
  const router = Router();

  const embeddingProvider = new GeminiEmbeddingProvider();
  const vectorRepository = new PineconeRepository();

  const ingestionService = new IngestionService(embeddingProvider, vectorRepository);
  const ragChatService = new RAGChatService(embeddingProvider, vectorRepository);

  const documentController = new DocumentController(ingestionService);
  const chatController = new ChatController(ragChatService);
  const healthController = new HealthController();

  router.use("/documents", createDocumentRouter(documentController));
  router.use("/chat", createChatRouter(chatController));
  router.use("/health", createHealthRouter(healthController));

  return router;
};
