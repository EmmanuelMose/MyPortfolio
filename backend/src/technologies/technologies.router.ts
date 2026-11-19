import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllTechnologiesController,
  getTechnologyByIdController,
  createTechnologyController,
  updateTechnologyController,
  deleteTechnologyController,
} from "./technologies.controller.js";

const technologiesRouter = Router();

technologiesRouter.get("/", getAllTechnologiesController);
technologiesRouter.get("/:id", getTechnologyByIdController);

technologiesRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 10) as unknown as RequestHandler,
  createTechnologyController
);

technologiesRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 10) as unknown as RequestHandler,
  updateTechnologyController
);

technologiesRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteTechnologyController);

export default technologiesRouter;