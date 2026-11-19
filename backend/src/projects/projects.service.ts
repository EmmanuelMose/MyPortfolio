import db from "../Drizzle/db.js";
import { projects, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllProjectsService = async () => {
  const allProjects = await db.query.projects.findMany({
    orderBy: asc(projects.displayOrder),
  });
  return allProjects;
};

export const getFeaturedProjectsService = async () => {
  const featuredProjects = await db.query.projects.findMany({
    where: eq(projects.isPublished, true),
    orderBy: asc(projects.displayOrder),
    limit: 3,
  });
  return featuredProjects;
};

export const getProjectByIdService = async (id: number) => {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};

export const createProjectService = async (
  data: {
    title: string;
    description: string;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
    techStack?: string | null;
    displayOrder?: number;
    isPublished?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newProject] = await db
    .insert(projects)
    .values({
      title: data.title,
      description: data.description,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      techStack: data.techStack || null,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished ?? false,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_PROJECT",
    actionDetails: `Created project: ${newProject.title}`,
    ipAddress,
  });

  return newProject;
};

export const updateProjectService = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
    techStack?: string | null;
    displayOrder?: number;
    isPublished?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (data.imageCloudinaryUrl && existingProject.imageCloudinaryUrl && data.imageCloudinaryUrl !== existingProject.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingProject.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updatedProject] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_PROJECT",
    actionDetails: `Updated project: ${existingProject.title}`,
    ipAddress,
  });

  return updatedProject;
};

export const deleteProjectService = async (id: number, adminId: number, ipAddress: string) => {
  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (existingProject.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingProject.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(projects).where(eq(projects.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_PROJECT",
    actionDetails: `Deleted project: ${existingProject.title}`,
    ipAddress,
  });
};