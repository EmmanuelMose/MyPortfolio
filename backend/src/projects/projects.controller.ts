import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllProjectsService,
  getFeaturedProjectsService,
  getProjectByIdService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
} from "./projects.service.js";
import { uploadFile } from "../utils/cloudinaryUpload.js";

export const getAllProjectsController = async (req: Request, res: Response) => {
  try {
    const projectsList = await getAllProjectsService();
    res.json({ success: true, data: projectsList });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeaturedProjectsController = async (req: Request, res: Response) => {
  try {
    const featured = await getFeaturedProjectsService();
    res.json({ success: true, data: featured });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjectByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? "" : idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const project = await getProjectByIdService(id);
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createProjectController = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, imageUrl, liveUrl, githubUrl, techStack, displayOrder, isPublished } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    let imageCloudinaryUrl = null;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/projects", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const newProject = await createProjectService(
      {
        title,
        description,
        imageCloudinaryUrl,
        imageUrl: imageUrl || null,
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        techStack: techStack || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isPublished: isPublished === "true" || isPublished === true,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.status(201).json({ success: true, data: newProject, message: "Project created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProjectController = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? "" : idParam, 10);
    const { title, description, imageUrl, liveUrl, githubUrl, techStack, displayOrder, isPublished } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    let imageCloudinaryUrl = undefined;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "myportfolio/projects", { resourceType: "image" });
      imageCloudinaryUrl = uploadResult.secureUrl;
    }

    const updatedProject = await updateProjectService(
      id,
      {
        title,
        description,
        imageCloudinaryUrl,
        imageUrl,
        liveUrl,
        githubUrl,
        techStack,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
        isPublished: isPublished !== undefined ? (isPublished === "true" || isPublished === true) : undefined,
      },
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updatedProject, message: "Project updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProjectController = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? "" : idParam, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    await deleteProjectService(id, req.user!.id, req.ip || "unknown");

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};