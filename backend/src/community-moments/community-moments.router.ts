import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllCommunityMomentsController,
  getCommunityMomentByIdController,
  createCommunityMomentController,
  updateCommunityMomentController,
  deleteCommunityMomentController,
} from "./community-moments.controller.js";

const communityMomentsRouter = Router();

communityMomentsRouter.get("/", getAllCommunityMomentsController);
communityMomentsRouter.get("/:id", getCommunityMomentByIdController);

communityMomentsRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  createCommunityMomentController
);

communityMomentsRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  updateCommunityMomentController
);

communityMomentsRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteCommunityMomentController);

export default communityMomentsRouter;