import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  getLogsController,
  getVisitorLogsController,
  getAdminLogsController,
  getLogByIdController,
  deleteLogController,
  deleteAllLogsController,
} from "./activity-logs.controller.js";

const activityLogsRouter = Router();

activityLogsRouter.get("/", authenticate, authorize("super_admin", "admin"), getLogsController);
activityLogsRouter.get("/visitors", authenticate, authorize("super_admin", "admin"), getVisitorLogsController);
activityLogsRouter.get("/admins", authenticate, authorize("super_admin"), getAdminLogsController);
activityLogsRouter.delete("/clear-all", authenticate, authorize("super_admin"), deleteAllLogsController);
activityLogsRouter.get("/:id", authenticate, authorize("super_admin"), getLogByIdController);
activityLogsRouter.delete("/:id", authenticate, authorize("super_admin"), deleteLogController);

export default activityLogsRouter;