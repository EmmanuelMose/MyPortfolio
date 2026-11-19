import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createDownloadRequestService,
  getAllDownloadRequestsService,
  getDownloadRequestByIdService,
  approveDownloadRequestService,
  rejectDownloadRequestService,
  downloadByTokenService,
  deleteDownloadRequestService,
} from "./download-requests.service.js";

export const createDownloadRequestController = async (req: Request, res: Response) => {
  try {
    const { requestType, targetId, requesterEmail } = req.body;

    if (!requestType || !requesterEmail) {
      return res.status(400).json({
        success: false,
        message: "requestType and requesterEmail are required",
      });
    }

    const newRequest = await createDownloadRequestService(
      {
        requestType,
        targetId: targetId ? parseInt(targetId) : null,
        requesterEmail,
      },
      req.ip || "unknown"
    );

    res.status(201).json({
      success: true,
      data: newRequest,
      message: "Request submitted. You will receive an email once approved.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllDownloadRequestsController = async (req: AuthRequest, res: Response) => {
  try {
    const list = await getAllDownloadRequestsService();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDownloadRequestByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid request ID" });

    const found = await getDownloadRequestByIdService(id);
    res.json({ success: true, data: found });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const approveDownloadRequestController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid request ID" });

    const updated = await approveDownloadRequestService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, data: updated, message: "Request approved and email sent to requester." });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectDownloadRequestController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid request ID" });

    const updated = await rejectDownloadRequestService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, data: updated, message: "Request rejected." });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const downloadByTokenController = async (req: Request, res: Response) => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const result = await downloadByTokenService(token, req.ip || "unknown");

    // Redirect to the actual file (Cloudinary URL)
    return res.redirect(result.fileUrl);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteDownloadRequestController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid request ID" });

    await deleteDownloadRequestService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Download request deleted." });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};