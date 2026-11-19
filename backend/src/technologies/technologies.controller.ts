import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllTechnologiesService,
  getTechnologyByIdService,
  createTechnologyService,
  updateTechnologyService,
  deleteTechnologyService,
} from "./technologies.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllTechnologiesController = async (req: Request, res: Response) => {
  try {
    const list = await getAllTechnologiesService();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTechnologyByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid technology ID" });

    const tech = await getTechnologyByIdService(id);
    res.json({ success: true, data: tech });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createTechnologyController = async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUrl, displayOrder } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    let imageCloudinaryUrl = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/technologies", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newTech = await createTechnologyService(
      {
        name,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newTech, message: "Technology created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTechnologyController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { name, imageUrl, displayOrder } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid technology ID" });

    let imageCloudinaryUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/technologies", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updated = await updateTechnologyService(
      id,
      {
        name,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updated, message: "Technology updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTechnologyController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid technology ID" });

    await deleteTechnologyService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Technology deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};