import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getLogsForRoleService,
  getVisitorLogsService,
  getAdminLogsService,
  getLogByIdService,
  deleteLogService,
  deleteAllLogsService,
} from "./activity-logs.service.js";

export const getLogsController = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await getLogsForRoleService(req.user!.role);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVisitorLogsController = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await getVisitorLogsService();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdminLogsController = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await getAdminLogsService();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLogByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid log ID" });

    const log = await getLogByIdService(id);
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteLogController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid log ID" });

    await deleteLogService(id);
    res.json({ success: true, message: "Activity log deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAllLogsController = async (req: AuthRequest, res: Response) => {
  try {
    await deleteAllLogsService();
    res.json({ success: true, message: "All activity logs cleared" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};