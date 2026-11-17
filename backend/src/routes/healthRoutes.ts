import { Router } from "express";
import { HealthController } from "../controllers/healthController.js";

export const createHealthRouter = (controller: HealthController): Router => {
  const router = Router();
  router.get("/", controller.check);
  return router;
};
