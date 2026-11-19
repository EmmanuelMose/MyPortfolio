import { Router } from "express";
import { authenticate, authorize, authorizeDownloadApproval } from "../middleware/auth.middleware.js";
import {
  createDownloadRequestController,
  getAllDownloadRequestsController,
  getDownloadRequestByIdController,
  approveDownloadRequestController,
  rejectDownloadRequestController,
  downloadByTokenController,
  deleteDownloadRequestController,
} from "./download-requests.controller.js";

const downloadRequestsRouter = Router();

// Public routes
downloadRequestsRouter.post("/", createDownloadRequestController);
downloadRequestsRouter.get("/download/:token", downloadByTokenController);

// View requests — both roles can see the list
downloadRequestsRouter.get("/", authenticate, authorize("super_admin", "admin"), getAllDownloadRequestsController);
downloadRequestsRouter.get("/:id", authenticate, authorize("super_admin", "admin"), getDownloadRequestByIdController);

// Approve/Reject — super_admin OR admin with canApproveDownloads
downloadRequestsRouter.patch("/:id/approve", authenticate, authorizeDownloadApproval, approveDownloadRequestController);
downloadRequestsRouter.patch("/:id/reject", authenticate, authorizeDownloadApproval, rejectDownloadRequestController);

// Delete — super_admin only
downloadRequestsRouter.delete("/:id", authenticate, authorize("super_admin"), deleteDownloadRequestController);

export default downloadRequestsRouter;