import { Router } from "express";
import { ChatController } from "../controllers/chatController.js";

export const createChatRouter = (controller: ChatController): Router => {
  const router = Router();
  router.post("/stream", controller.stream);
  return router;
};
