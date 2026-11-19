import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllCertificationsService,
  getFeaturedCertificationsService,
  getCertificationByIdService,
  createCertificationService,
  updateCertificationService,
  deleteCertificationService,
} from "./certifications.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllCertificationsController = async (req: Request, res: Response) => {
  try {
    const certs = await getAllCertificationsService();
    res.json({ success: true, data: certs });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeaturedCertificationsController = async (req: Request, res: Response) => {
  try {
    const featured = await getFeaturedCertificationsService();
    res.json({ success: true, data: featured });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCertificationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid certification ID" });
    }

    const cert = await getCertificationByIdService(id);
    res.json({ success: true, data: cert });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createCertificationController = async (req: AuthRequest, res: Response) => {
  try {
    const { title, issuer, description, imageUrl, displayOrder } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({ success: false, message: "title and issuer are required" });
    }

    let imageCloudinaryUrl = null;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/certifications", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newCert = await createCertificationService(
      {
        title,
        issuer,
        description: description || null,
        imageCloudinaryUrl,
        imageUrl: imageUrl || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newCert, message: "Certification created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCertificationController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { title, issuer, description, imageUrl, displayOrder } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid certification ID" });
    }

    let imageCloudinaryUrl = undefined;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/certifications", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updatedCert = await updateCertificationService(
      id,
      {
        title,
        issuer,
        description,
        imageCloudinaryUrl,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedCert, message: "Certification updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCertificationController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid certification ID" });
    }

    await deleteCertificationService(id, req.user!.id, req.ip || "unknown");

    res.json({ success: true, message: "Certification deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};