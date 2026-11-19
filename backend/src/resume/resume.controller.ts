import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getResumeService,
  createResumeService,
  updateResumeService,
  deleteResumeService,
} from "./resume.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getResumeController = async (req: Request, res: Response) => {
  try {
    const found = await getResumeService();
    res.json({ success: true, data: found });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createResumeController = async (req: AuthRequest, res: Response) => {
  try {
    const { fileUrl, isActive } = req.body;

    let fileCloudinaryUrl = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/resume", { resourceType: "raw" });
      fileCloudinaryUrl = uploadResult.secureUrl;
    }

    if (!fileCloudinaryUrl && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Either upload a resume file or provide fileUrl",
      });
    }

    const newResume = await createResumeService(
      {
        fileCloudinaryUrl,
        fileUrl: fileUrl || null,
        isActive: isActive === "true" || isActive === true,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newResume, message: "Resume created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateResumeController = async (req: AuthRequest, res: Response) => {
  try {
    const { fileUrl, isActive } = req.body;

    let fileCloudinaryUrl = undefined;
    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/resume", { resourceType: "raw" });
      fileCloudinaryUrl = uploadResult.secureUrl;
    }

    const updated = await updateResumeService(
      {
        fileCloudinaryUrl,
        fileUrl,
        isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updated, message: "Resume updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteResumeController = async (req: AuthRequest, res: Response) => {
  try {
    await deleteResumeService(req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};