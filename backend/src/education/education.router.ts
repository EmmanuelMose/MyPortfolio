import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllEducationController,
  getEducationByIdController,
  createEducationController,
  updateEducationController,
  deleteEducationController,
} from "./education.controller.js";

const educationRouter = Router();

educationRouter.get("/", getAllEducationController);
educationRouter.get("/:id", getEducationByIdController);

educationRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  createEducationController
);

educationRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  updateEducationController
);

educationRouter.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  deleteEducationController
);

export default educationRouter;