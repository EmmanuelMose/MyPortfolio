import db from "../Drizzle/db.js";
import { communityMoments, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllCommunityMomentsService = async () => {
  return await db.query.communityMoments.findMany({
    orderBy: asc(communityMoments.displayOrder),
  });
};

export const getCommunityMomentByIdService = async (id: number) => {
  const moment = await db.query.communityMoments.findFirst({
    where: eq(communityMoments.id, id),
  });
  if (!moment) throw new Error("Community moment not found");
  return moment;
};

export const createCommunityMomentService = async (
  data: {
    title: string;
    description?: string | null;
    dateOfEvent?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newMoment] = await db
    .insert(communityMoments)
    .values({
      title: data.title,
      description: data.description || null,
      dateOfEvent: data.dateOfEvent || null,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_COMMUNITY_MOMENT",
    actionDetails: `Created community moment: ${newMoment.title}`,
    ipAddress,
  });

  return newMoment;
};

export const updateCommunityMomentService = async (
  id: number,
  data: {
    title?: string;
    description?: string | null;
    dateOfEvent?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.communityMoments.findFirst({
    where: eq(communityMoments.id, id),
  });
  if (!existing) throw new Error("Community moment not found");

  if (data.imageCloudinaryUrl && existing.imageCloudinaryUrl && data.imageCloudinaryUrl !== existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updated] = await db
    .update(communityMoments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(communityMoments.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_COMMUNITY_MOMENT",
    actionDetails: `Updated community moment: ${existing.title}`,
    ipAddress,
  });

  return updated;
};

export const deleteCommunityMomentService = async (id: number, adminId: number, ipAddress: string) => {
  const existing = await db.query.communityMoments.findFirst({
    where: eq(communityMoments.id, id),
  });
  if (!existing) throw new Error("Community moment not found");

  if (existing.imageCloudinaryUrl) {
    const publicId = extractPublicId(existing.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(communityMoments).where(eq(communityMoments.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_COMMUNITY_MOMENT",
    actionDetails: `Deleted community moment: ${existing.title}`,
    ipAddress,
  });
};