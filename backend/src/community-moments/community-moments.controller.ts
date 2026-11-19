import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllCommunityMomentsService,
  getCommunityMomentByIdService,
  createCommunityMomentService,
  updateCommunityMomentService,
  deleteCommunityMomentService,
} from "./community-moments.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllCommunityMomentsController = async (req: Request, res: Response) => {
  try {
    const list = await getAllCommunityMomentsService();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCommunityMomentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid community moment ID" });

    const moment = await getCommunityMomentByIdService(id);
    res.json({ success: true, data: moment });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createCommunityMomentController = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dateOfEvent, imageUrl, displayOrder } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    let imageCloudinaryUrl = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/community-moments", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newMoment = await createCommunityMomentService(
      {
        title,
        description,
        dateOfEvent,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newMoment, message: "Community moment created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCommunityMomentController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { title, description, dateOfEvent, imageUrl, displayOrder } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid community moment ID" });

    let imageCloudinaryUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/community-moments", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updated = await updateCommunityMomentService(
      id,
      {
        title,
        description,
        dateOfEvent,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updated, message: "Community moment updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCommunityMomentController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid community moment ID" });

    await deleteCommunityMomentService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Community moment deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};