import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllHeroSkillsService,
  createHeroSkillService,
  updateHeroSkillService,
  deleteHeroSkillService,
} from "./hero-skills.service.js";

export const getAllHeroSkillsController = async (req: Request, res: Response) => {
  try {
    const skills = await getAllHeroSkillsService();
    res.json({ success: true, data: skills });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createHeroSkillController = async (req: AuthRequest, res: Response) => {
  try {
    const { title, displayOrder, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const newSkill = await createHeroSkillService(
      { title, displayOrder, isActive },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newSkill, message: "Hero skill created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHeroSkillController = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam);
    const { title, displayOrder, isActive } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid skill ID" });
    }

    const updatedSkill = await updateHeroSkillService(
      id,
      { title, displayOrder, isActive },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedSkill, message: "Hero skill updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHeroSkillController = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid skill ID" });
    }

    await deleteHeroSkillService(id, req.user!.id, req.ip || "unknown");

    res.json({ success: true, message: "Hero skill deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};