import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllProjectsController,
  getFeaturedProjectsController,
  getProjectByIdController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from "./projects.controller.js";

const projectsRouter = Router();

// Public Routes
projectsRouter.get("/", getAllProjectsController);
projectsRouter.get("/featured", getFeaturedProjectsController);
projectsRouter.get("/:id", getProjectByIdController);

// Protected Routes (Admin & Super Admin)
projectsRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  createProjectController
);

projectsRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  updateProjectController
);

projectsRouter.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  deleteProjectController
);

export default projectsRouter;