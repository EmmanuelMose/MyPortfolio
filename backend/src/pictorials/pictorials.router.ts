import { Router, type RequestHandler } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import {
  getAllPictorialsController,
  getPictorialsByCategoryController,
  getPictorialByIdController,
  createPictorialController,
  updatePictorialController,
  deletePictorialController,
} from "./pictorials.controller.js";

const pictorialsRouter = Router();

pictorialsRouter.get("/", getAllPictorialsController);
pictorialsRouter.get("/category/:category", getPictorialsByCategoryController);
pictorialsRouter.get("/:id", getPictorialByIdController);

pictorialsRouter.post(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  createPictorialController
);

pictorialsRouter.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  uploadSingle("imageFile", 20) as unknown as RequestHandler,
  updatePictorialController
);

pictorialsRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deletePictorialController);

export default pictorialsRouter;