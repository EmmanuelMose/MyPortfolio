import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllCertificationsController,
  getFeaturedCertificationsController,
  getCertificationByIdController,
  createCertificationController,
  updateCertificationController,
  deleteCertificationController,
} from "./certifications.controller.js";

const certificationsRouter = Router();

// Public Routes
certificationsRouter.get("/", getAllCertificationsController);
certificationsRouter.get("/featured", getFeaturedCertificationsController);
certificationsRouter.get("/:id", getCertificationByIdController);

// Protected Routes (Admin & Super Admin)
certificationsRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  createCertificationController
);

certificationsRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  updateCertificationController
);

certificationsRouter.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  deleteCertificationController
);

export default certificationsRouter;