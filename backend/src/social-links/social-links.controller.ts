import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllSocialLinksService,
  createSocialLinkService,
  updateSocialLinkService,
  deleteSocialLinkService,
} from "./social-links.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllSocialLinksController = async (req: Request, res: Response) => {
  try {
    const links = await getAllSocialLinksService();
    res.json({ success: true, data: links });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createSocialLinkController = async (req: AuthRequest, res: Response) => {
  try {
    const { platformName, url, platformIconUrl, displayOrder, isActive } = req.body;

    if (!platformName || !url) {
      return res.status(400).json({ success: false, message: "platformName and url are required" });
    }

    let platformIconCloudinaryUrl = null;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/social-icons", { resourceType: "image" });
      platformIconCloudinaryUrl = uploadResult.secureUrl;
    }

    const newLink = await createSocialLinkService(
      {
        platformName,
        url,
        platformIconCloudinaryUrl,
        platformIconUrl: platformIconUrl || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: isActive === "true" || isActive === true,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newLink, message: "Social link created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSocialLinkController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { platformName, url, platformIconUrl, displayOrder, isActive } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid social link ID" });
    }

    let platformIconCloudinaryUrl = undefined;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/social-icons", { resourceType: "image" });
      platformIconCloudinaryUrl = uploadResult.secureUrl;
    }

    const updatedLink = await updateSocialLinkService(
      id,
      {
        platformName,
        url,
        platformIconCloudinaryUrl,
        platformIconUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
        isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedLink, message: "Social link updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSocialLinkController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid social link ID" });
    }

    await deleteSocialLinkService(id, req.user!.id, req.ip || "unknown");

    res.json({ success: true, message: "Social link deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};