import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllPictorialsService,
  getPictorialsByCategoryService,
  getPictorialByIdService,
  createPictorialService,
  updatePictorialService,
  deletePictorialService,
} from "./pictorials.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

const VALID_CATEGORIES = ["TECH_FIELD", "OTHER_ASPECTS_OF_LIFE"];

export const getAllPictorialsController = async (req: Request, res: Response) => {
  try {
    const list = await getAllPictorialsService();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPictorialsByCategoryController = async (req: Request, res: Response) => {
  try {
    const category = Array.isArray(req.params.category) ? req.params.category[0] : req.params.category;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    const list = await getPictorialsByCategoryService(category);
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPictorialByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid pictorial ID" });

    const pic = await getPictorialByIdService(id);
    res.json({ success: true, data: pic });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createPictorialController = async (req: AuthRequest, res: Response) => {
  try {
    const { category, title, description, imageUrl, displayOrder } = req.body;

    if (!category) return res.status(400).json({ success: false, message: "category is required" });
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    let imageCloudinaryUrl = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/pictorials", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newPic = await createPictorialService(
      {
        category,
        title,
        description,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newPic, message: "Pictorial created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePictorialController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { category, title, description, imageUrl, displayOrder } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid pictorial ID" });

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    let imageCloudinaryUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/pictorials", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updated = await updatePictorialService(
      id,
      {
        category,
        title,
        description,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updated, message: "Pictorial updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePictorialController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid pictorial ID" });

    await deletePictorialService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Pictorial deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};