import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllSettingsService,
  getPublicSettingsService,
  getSettingByKeyService,
  upsertSettingService,
  bulkUpdateSettingsService,
  deleteSettingService,
} from "./settings.service.js";

export const getAllSettingsController = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getAllSettingsService();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicSettingsController = async (req: Request, res: Response) => {
  try {
    const settings = await getPublicSettingsService();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSettingByKeyController = async (req: AuthRequest, res: Response) => {
  try {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) return res.status(400).json({ success: false, message: "Setting key is required" });

    const found = await getSettingByKeyService(key);
    res.json({ success: true, data: found });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const upsertSettingController = async (req: AuthRequest, res: Response) => {
  try {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) return res.status(400).json({ success: false, message: "Setting key is required" });

    if (!req.body || req.body.value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Request body must contain { \"value\": \"...\" }",
      });
    }

    const result = await upsertSettingService(
      key,
      String(req.body.value),
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: result, message: `Setting '${key}' saved` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkUpdateSettingsController = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Body must contain { \"settings\": [ { \"key\": \"...\", \"value\": \"...\" } ] }",
      });
    }

    const results = await bulkUpdateSettingsService(
      settings,
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: results, message: "Settings updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSettingController = async (req: AuthRequest, res: Response) => {
  try {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) return res.status(400).json({ success: false, message: "Setting key is required" });

    await deleteSettingService(key, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: `Setting '${key}' deleted` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};