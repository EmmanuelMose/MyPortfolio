import db from "../Drizzle/db.js";
import { resume, activityLogs } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getResumeService = async () => {
  const found = await db.query.resume.findFirst();
  if (!found) throw new Error("Resume not found");
  return found;
};

export const createResumeService = async (
  data: {
    fileCloudinaryUrl?: string | null;
    fileUrl?: string | null;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.resume.findFirst();
  if (existing) throw new Error("Resume already exists. Please use the update endpoint.");

  const [newResume] = await db
    .insert(resume)
    .values({
      fileCloudinaryUrl: data.fileCloudinaryUrl || null,
      fileUrl: data.fileUrl || null,
      isActive: data.isActive ?? true,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_RESUME",
    actionDetails: "Created resume record",
    ipAddress,
  });

  return newResume;
};

export const updateResumeService = async (
  data: {
    fileCloudinaryUrl?: string | null;
    fileUrl?: string | null;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.resume.findFirst();
  if (!existing) throw new Error("Resume not found. Please create one first.");

  if (data.fileCloudinaryUrl && existing.fileCloudinaryUrl && data.fileCloudinaryUrl !== existing.fileCloudinaryUrl) {
    const publicId = extractPublicId(existing.fileCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updated] = await db
    .update(resume)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(resume.id, existing.id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_RESUME",
    actionDetails: "Updated resume record",
    ipAddress,
  });

  return updated;
};

export const deleteResumeService = async (adminId: number, ipAddress: string) => {
  const existing = await db.query.resume.findFirst();
  if (!existing) throw new Error("Resume not found");

  if (existing.fileCloudinaryUrl) {
    const publicId = extractPublicId(existing.fileCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(resume).where(eq(resume.id, existing.id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_RESUME",
    actionDetails: "Deleted resume record",
    ipAddress,
  });
};