import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  getAllExperienceController,
  getExperienceByIdController,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from "./experience.controller.js";

const experienceRouter = Router();

experienceRouter.get("/", getAllExperienceController);
experienceRouter.get("/:id", getExperienceByIdController);

experienceRouter.post("/", authenticate, authorize("super_admin", "admin"), createExperienceController);
experienceRouter.put("/:id", authenticate, authorize("super_admin", "admin"), updateExperienceController);
experienceRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteExperienceController);

export default experienceRouter;