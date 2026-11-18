import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllSocialLinksController,
  createSocialLinkController,
  updateSocialLinkController,
  deleteSocialLinkController,
} from "./social-links.controller.js";

const socialLinksRouter = Router();

socialLinksRouter.get("/", getAllSocialLinksController);

socialLinksRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("platformIconFile", 10) as unknown as RequestHandler,
  createSocialLinkController
);

socialLinksRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("platformIconFile", 10) as unknown as RequestHandler,
  updateSocialLinkController
);

socialLinksRouter.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  deleteSocialLinkController
);

export default socialLinksRouter;