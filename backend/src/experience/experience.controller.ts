import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllExperienceService,
  getExperienceByIdService,
  createExperienceService,
  updateExperienceService,
  deleteExperienceService,
} from "./experience.service.js";

export const getAllExperienceController = async (req: Request, res: Response) => {
  try {
    const expList = await getAllExperienceService();
    res.json({ success: true, data: expList });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExperienceByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid experience ID" });

    const exp = await getExperienceByIdService(id);
    res.json({ success: true, data: exp });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createExperienceController = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, roleTitle, description, startDate, endDate, displayOrder } = req.body;

    if (!companyName || !roleTitle) {
      return res.status(400).json({ success: false, message: "companyName and roleTitle are required" });
    }

    const newExp = await createExperienceService(
      {
        companyName,
        roleTitle,
        description,
        startDate,
        endDate,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newExp, message: "Experience created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateExperienceController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { companyName, roleTitle, description, startDate, endDate, displayOrder } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid experience ID" });

    const updatedExp = await updateExperienceService(
      id,
      {
        companyName,
        roleTitle,
        description,
        startDate,
        endDate,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedExp, message: "Experience updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExperienceController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid experience ID" });

    await deleteExperienceService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Experience deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};