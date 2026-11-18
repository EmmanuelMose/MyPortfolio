import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  getAllHeroSkillsController,
  createHeroSkillController,
  updateHeroSkillController,
  deleteHeroSkillController,
} from "./hero-skills.controller.js";

const heroSkillsRouter = Router();

// Public Route
heroSkillsRouter.get("/", getAllHeroSkillsController);

// Protected Routes (Admin & Super Admin)
heroSkillsRouter.post("/", authenticate, authorize("super_admin", "admin"), createHeroSkillController);
heroSkillsRouter.put("/:id", authenticate, authorize("super_admin", "admin"), updateHeroSkillController);
heroSkillsRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteHeroSkillController);

export default heroSkillsRouter;