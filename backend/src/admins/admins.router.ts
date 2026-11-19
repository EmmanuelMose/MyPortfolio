import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  listAdminsController,
  getAdminByIdController,
  inviteAdminController,
  toggleAdminPermissionController,
  toggleAdminActiveController,
  deleteAdminController,
  deleteInviteController,
} from "./admins.controller.js";

const adminsRouter = Router();

// All admins management is super_admin only
adminsRouter.get("/", authenticate, authorize("super_admin"), listAdminsController);
adminsRouter.post("/invite", authenticate, authorize("super_admin"), inviteAdminController);
adminsRouter.get("/:id", authenticate, authorize("super_admin"), getAdminByIdController);
adminsRouter.patch("/:id/permissions", authenticate, authorize("super_admin"), toggleAdminPermissionController);
adminsRouter.patch("/:id/status", authenticate, authorize("super_admin"), toggleAdminActiveController);
adminsRouter.delete("/invite/:id", authenticate, authorize("super_admin"), deleteInviteController);
adminsRouter.delete("/:id", authenticate, authorize("super_admin"), deleteAdminController);

export default adminsRouter;