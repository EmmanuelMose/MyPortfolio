import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  uploadFileController,
  deleteFileController,
  deleteMultipleFilesController,
} from "./cloudinary.controller.js";

const cloudinaryRouter = Router();

cloudinaryRouter.post(
  "/upload",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("file", 50) as unknown as RequestHandler,
  uploadFileController
);

cloudinaryRouter.delete(
  "/delete",
  authenticate,
  authorize("super_admin", "admin"),
  deleteFileController
);

cloudinaryRouter.delete(
  "/delete-multiple",
  authenticate,
  authorize("super_admin", "admin"),
  deleteMultipleFilesController
);

export default cloudinaryRouter;