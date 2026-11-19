import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllEducationService,
  getEducationByIdService,
  createEducationService,
  updateEducationService,
  deleteEducationService,
} from "./education.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllEducationController = async (req: Request, res: Response) => {
  try {
    const eduList = await getAllEducationService();
    res.json({ success: true, data: eduList });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getEducationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid education ID" });

    const edu = await getEducationByIdService(id);
    res.json({ success: true, data: edu });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createEducationController = async (req: AuthRequest, res: Response) => {
  try {
    const { institutionName, degreeOrCourse, description, startDate, endDate, imageUrl, displayOrder } = req.body;

    if (!institutionName || !degreeOrCourse) {
      return res.status(400).json({ success: false, message: "institutionName and degreeOrCourse are required" });
    }

    let imageCloudinaryUrl = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/education", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newEdu = await createEducationService(
      {
        institutionName,
        degreeOrCourse,
        description,
        startDate,
        endDate,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newEdu, message: "Education record created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEducationController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { institutionName, degreeOrCourse, description, startDate, endDate, imageUrl, displayOrder } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid education ID" });

    let imageCloudinaryUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/education", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updatedEdu = await updateEducationService(
      id,
      {
        institutionName,
        degreeOrCourse,
        description,
        startDate,
        endDate,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedEdu, message: "Education record updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEducationController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid education ID" });

    await deleteEducationService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Education record deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};