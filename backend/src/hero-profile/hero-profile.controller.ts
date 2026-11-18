import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getHeroProfileService,
  createHeroProfileService,
  updateHeroProfileService,
  deleteHeroProfileService,
} from "./hero-profile.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getHeroProfileController = async (req: Request, res: Response) => {
  try {
    const profile = await getHeroProfileService();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createHeroProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, greeting, bio, cvUploadUrl, profileImageUrl } = req.body;

    if (!fullName || !greeting || !bio) {
      return res.status(400).json({ success: false, message: "fullName, greeting, and bio are required" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let cvCloudinaryUrl = null;
    let profileImageCloudinaryUrl = null;

    if (files && files["cvFile"] && files["cvFile"][0]) {
      const cvFile = files["cvFile"][0];
      const uploadResult = await uploadFile(cvFile.buffer, "myportfolio/cv", { resourceType: "raw" });
      cvCloudinaryUrl = uploadResult.secureUrl;
    }

    if (files && files["profileImageFile"] && files["profileImageFile"][0]) {
      const profileFile = files["profileImageFile"][0];
      const uploadResult = await uploadFile(profileFile.buffer, "myportfolio/profile", { resourceType: "image" });
      profileImageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newProfile = await createHeroProfileService(
      {
        fullName,
        greeting,
        bio,
        cvCloudinaryUrl,
        cvUploadUrl: cvUploadUrl || null,
        profileImageCloudinaryUrl,
        profileImageUrl: profileImageUrl || null,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newProfile, message: "Hero profile created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHeroProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, greeting, bio, cvUploadUrl, profileImageUrl } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let cvCloudinaryUrl = undefined;
    let profileImageCloudinaryUrl = undefined;

    if (files && files["cvFile"] && files["cvFile"][0]) {
      const cvFile = files["cvFile"][0];
      const uploadResult = await uploadFile(cvFile.buffer, "myportfolio/cv", { resourceType: "raw" });
      cvCloudinaryUrl = uploadResult.secureUrl;
    }

    if (files && files["profileImageFile"] && files["profileImageFile"][0]) {
      const profileFile = files["profileImageFile"][0];
      const uploadResult = await uploadFile(profileFile.buffer, "myportfolio/profile", { resourceType: "image" });
      profileImageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updatedProfile = await updateHeroProfileService(
      {
        fullName,
        greeting,
        bio,
        cvCloudinaryUrl,
        cvUploadUrl,
        profileImageCloudinaryUrl,
        profileImageUrl,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedProfile, message: "Hero profile updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHeroProfileController = async (req: AuthRequest, res: Response) => {
  try {
    await deleteHeroProfileService(req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Hero profile deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};