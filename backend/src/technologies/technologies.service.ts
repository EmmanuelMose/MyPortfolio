import db from "../Drizzle/db.js";
import { technologies, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllTechnologiesService = async () => {
  return await db.query.technologies.findMany({
    orderBy: asc(technologies.displayOrder),
  });
};

export const getTechnologyByIdService = async (id: number) => {
  const tech = await db.query.technologies.findFirst({
    where: eq(technologies.id, id),
  });
  if (!tech) throw new Error("Technology not found");
  return tech;
};

export const createTechnologyService = async (
  data: {
    name: string;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newTech] = await db
    .insert(technologies)
    .values({
      name: data.name,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_TECHNOLOGY",
    actionDetails: `Created technology: ${newTech.name}`,
    ipAddress,
  });

  return newTech;
};

export const updateTechnologyService = async (
  id: number,
  data: {
    name?: string;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.technologies.findFirst({
    where: eq(technologies.id, id),
  });
  if (!existing) throw new Error("Technology not found");

  if (data.imageCloudinaryUrl && existing.imageCloudinaryUrl && data.imageCloudinaryUrl !== existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updated] = await db
    .update(technologies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(technologies.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_TECHNOLOGY",
    actionDetails: `Updated technology: ${existing.name}`,
    ipAddress,
  });

  return updated;
};

export const deleteTechnologyService = async (id: number, adminId: number, ipAddress: string) => {
  const existing = await db.query.technologies.findFirst({
    where: eq(technologies.id, id),
  });
  if (!existing) throw new Error("Technology not found");

  if (existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(technologies).where(eq(technologies.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_TECHNOLOGY",
    actionDetails: `Deleted technology: ${existing.name}`,
    ipAddress,
  });
};