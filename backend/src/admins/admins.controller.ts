import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  listAdminsService,
  getAdminByIdService,
  inviteAdminService,
  toggleAdminPermissionService,
  toggleAdminActiveService,
  deleteAdminService,
  deleteInviteService,
} from "./admins.service.js";

export const listAdminsController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await listAdminsService();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdminByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid admin ID" });

    const admin = await getAdminByIdService(id);
    res.json({ success: true, data: admin });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const inviteAdminController = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });

    const invite = await inviteAdminService(email, req.user!.id, req.ip || "unknown");
    res.status(201).json({ success: true, data: invite, message: `Invitation sent to ${email}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleAdminPermissionController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { canApproveDownloads } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid admin ID" });
    if (typeof canApproveDownloads !== "boolean") {
      return res.status(400).json({ success: false, message: "canApproveDownloads must be a boolean" });
    }

    const updated = await toggleAdminPermissionService(
      id,
      canApproveDownloads,
      req.user!.id,
      req.ip || "unknown"
    );
    res.json({ success: true, data: updated, message: `Permission updated successfully` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleAdminActiveController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { isActive } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid admin ID" });
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean" });
    }

    const updated = await toggleAdminActiveService(id, isActive, req.user!.id, req.ip || "unknown");
    res.json({ success: true, data: updated, message: `Admin ${isActive ? "activated" : "deactivated"}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAdminController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid admin ID" });

    const result = await deleteAdminService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, data: result, message: "Admin deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteInviteController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid invite ID" });

    const result = await deleteInviteService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, data: result, message: "Invite deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};