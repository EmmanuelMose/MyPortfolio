import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadFields } from "../middleware/upload.middleware.js";
import {
  getHeroProfileController,
  createHeroProfileController,
  updateHeroProfileController,
  deleteHeroProfileController,
} from "./hero-profile.controller.js";

const heroProfileRouter = Router();

heroProfileRouter.get("/", getHeroProfileController);

heroProfileRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadFields([
    { name: "cvFile", maxCount: 1 },
    { name: "profileImageFile", maxCount: 1 }
  ], 50) as unknown as RequestHandler,
  createHeroProfileController
);

heroProfileRouter.put(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadFields([
    { name: "cvFile", maxCount: 1 },
    { name: "profileImageFile", maxCount: 1 }
  ], 50) as unknown as RequestHandler,
  updateHeroProfileController
);

heroProfileRouter.delete(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  deleteHeroProfileController
);

export default heroProfileRouter;