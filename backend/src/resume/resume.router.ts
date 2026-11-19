import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getResumeController,
  createResumeController,
  updateResumeController,
  deleteResumeController,
} from "./resume.controller.js";

const resumeRouter = Router();

resumeRouter.get("/", getResumeController);

resumeRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("resumeFile", 20) as unknown as RequestHandler,
  createResumeController
);

resumeRouter.put(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("resumeFile", 20) as unknown as RequestHandler,
  updateResumeController
);

resumeRouter.delete("/", authenticate, authorize("super_admin", "admin"), deleteResumeController);

export default resumeRouter;