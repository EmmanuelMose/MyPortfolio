import db from "../Drizzle/db.js";
import { socialLinks, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllSocialLinksService = async () => {
  const links = await db.query.socialLinks.findMany({
    orderBy: asc(socialLinks.displayOrder),
  });
  return links;
};

export const createSocialLinkService = async (
  data: {
    platformName: string;
    url: string;
    platformIconCloudinaryUrl?: string | null;
    platformIconUrl?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newLink] = await db
    .insert(socialLinks)
    .values({
      platformName: data.platformName,
      url: data.url,
      platformIconCloudinaryUrl: data.platformIconCloudinaryUrl || null,
      platformIconUrl: data.platformIconUrl || null,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_SOCIAL_LINK",
    actionDetails: `Created social link: ${newLink.platformName}`,
    ipAddress,
  });

  return newLink;
};

export const updateSocialLinkService = async (
  id: number,
  data: {
    platformName?: string;
    url?: string;
    platformIconCloudinaryUrl?: string | null;
    platformIconUrl?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingLink = await db.query.socialLinks.findFirst({
    where: eq(socialLinks.id, id),
  });

  if (!existingLink) {
    throw new Error("Social link not found");
  }

  if (data.platformIconCloudinaryUrl && existingLink.platformIconCloudinaryUrl && data.platformIconCloudinaryUrl !== existingLink.platformIconCloudinaryUrl) {
    const publicId = extractPublicId(existingLink.platformIconCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updatedLink] = await db
    .update(socialLinks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(socialLinks.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_SOCIAL_LINK",
    actionDetails: `Updated social link: ${existingLink.platformName}`,
    ipAddress,
  });

  return updatedLink;
};

export const deleteSocialLinkService = async (id: number, adminId: number, ipAddress: string) => {
  const existingLink = await db.query.socialLinks.findFirst({
    where: eq(socialLinks.id, id),
  });

  if (!existingLink) {
    throw new Error("Social link not found");
  }

  if (existingLink.platformIconCloudinaryUrl) {
    const publicId = extractPublicId(existingLink.platformIconCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(socialLinks).where(eq(socialLinks.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_SOCIAL_LINK",
    actionDetails: `Deleted social link: ${existingLink.platformName}`,
    ipAddress,
  });
};