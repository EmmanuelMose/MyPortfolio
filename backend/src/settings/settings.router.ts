import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  getAllSettingsController,
  getPublicSettingsController,
  getSettingByKeyController,
  upsertSettingController,
  bulkUpdateSettingsController,
  deleteSettingController,
} from "./settings.controller.js";

const settingsRouter = Router();

settingsRouter.get("/public", getPublicSettingsController);

settingsRouter.get("/", authenticate, authorize("super_admin"), getAllSettingsController);
settingsRouter.patch("/bulk", authenticate, authorize("super_admin"), bulkUpdateSettingsController);
settingsRouter.get("/:key", authenticate, authorize("super_admin"), getSettingByKeyController);
settingsRouter.put("/:key", authenticate, authorize("super_admin"), upsertSettingController);
settingsRouter.delete("/:key", authenticate, authorize("super_admin"), deleteSettingController);

export default settingsRouter;