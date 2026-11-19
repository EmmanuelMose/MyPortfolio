import db from "../Drizzle/db.js";
import { pictorials, activityLogs } from "../Drizzle/schema.js";
import { eq, asc, and } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllPictorialsService = async () => {
  return await db.query.pictorials.findMany({
    orderBy: asc(pictorials.displayOrder),
  });
};

export const getPictorialsByCategoryService = async (category: string) => {
  return await db.query.pictorials.findMany({
    where: eq(pictorials.category, category),
    orderBy: asc(pictorials.displayOrder),
  });
};

export const getPictorialByIdService = async (id: number) => {
  const pic = await db.query.pictorials.findFirst({
    where: eq(pictorials.id, id),
  });
  if (!pic) throw new Error("Pictorial not found");
  return pic;
};

export const createPictorialService = async (
  data: {
    category: string;
    title?: string | null;
    description?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newPic] = await db
    .insert(pictorials)
    .values({
      category: data.category,
      title: data.title || null,
      description: data.description || null,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_PICTORIAL",
    actionDetails: `Created pictorial in category: ${newPic.category}`,
    ipAddress,
  });

  return newPic;
};

export const updatePictorialService = async (
  id: number,
  data: {
    category?: string;
    title?: string | null;
    description?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.pictorials.findFirst({
    where: eq(pictorials.id, id),
  });
  if (!existing) throw new Error("Pictorial not found");

  if (data.imageCloudinaryUrl && existing.imageCloudinaryUrl && data.imageCloudinaryUrl !== existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updated] = await db
    .update(pictorials)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pictorials.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_PICTORIAL",
    actionDetails: `Updated pictorial #${id}`,
    ipAddress,
  });

  return updated;
};

export const deletePictorialService = async (id: number, adminId: number, ipAddress: string) => {
  const existing = await db.query.pictorials.findFirst({
    where: eq(pictorials.id, id),
  });
  if (!existing) throw new Error("Pictorial not found");

  if (existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(pictorials).where(eq(pictorials.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_PICTORIAL",
    actionDetails: `Deleted pictorial from category: ${existing.category}`,
    ipAddress,
  });
};