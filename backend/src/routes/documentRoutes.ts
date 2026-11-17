import { Router } from "express";
import { DocumentController } from "../controllers/documentController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

export const createDocumentRouter = (controller: DocumentController): Router => {
  const router = Router();
  router.post("/ingest", upload.single("file"), controller.ingest);
  return router;
};
