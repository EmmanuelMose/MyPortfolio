import db from "../Drizzle/db.js";
import { heroProfile, activityLogs } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getHeroProfileService = async () => {
  const profile = await db.query.heroProfile.findFirst();
  if (!profile) {
    throw new Error("Hero profile not found");
  }
  return profile;
};

export const createHeroProfileService = async (
  data: {
    fullName: string;
    greeting: string;
    bio: string;
    cvCloudinaryUrl?: string | null;
    cvUploadUrl?: string | null;
    profileImageCloudinaryUrl?: string | null;
    profileImageUrl?: string | null;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingProfile = await db.query.heroProfile.findFirst();
  if (existingProfile) {
    throw new Error("Hero profile already exists. Please use the update endpoint.");
  }

  const [newProfile] = await db.insert(heroProfile).values(data).returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_HERO_PROFILE",
    actionDetails: "Created the hero profile",
    ipAddress,
  });

  return newProfile;
};

export const updateHeroProfileService = async (
  data: {
    fullName?: string;
    greeting?: string;
    bio?: string;
    cvCloudinaryUrl?: string | null;
    cvUploadUrl?: string | null;
    profileImageCloudinaryUrl?: string | null;
    profileImageUrl?: string | null;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingProfile = await db.query.heroProfile.findFirst();
  if (!existingProfile) {
    throw new Error("Hero profile not found. Please create one first.");
  }

  if (data.cvCloudinaryUrl && existingProfile.cvCloudinaryUrl && data.cvCloudinaryUrl !== existingProfile.cvCloudinaryUrl) {
    const publicId = extractPublicId(existingProfile.cvCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  if (data.profileImageCloudinaryUrl && existingProfile.profileImageCloudinaryUrl && data.profileImageCloudinaryUrl !== existingProfile.profileImageCloudinaryUrl) {
    const publicId = extractPublicId(existingProfile.profileImageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updatedProfile] = await db
    .update(heroProfile)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(heroProfile.id, existingProfile.id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_HERO_PROFILE",
    actionDetails: "Updated the hero profile",
    ipAddress,
  });

  return updatedProfile;
};

export const deleteHeroProfileService = async (adminId: number, ipAddress: string) => {
  const existingProfile = await db.query.heroProfile.findFirst();
  if (!existingProfile) {
    throw new Error("Hero profile not found");
  }

  if (existingProfile.cvCloudinaryUrl) {
    const publicId = extractPublicId(existingProfile.cvCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  if (existingProfile.profileImageCloudinaryUrl) {
    const publicId = extractPublicId(existingProfile.profileImageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(heroProfile).where(eq(heroProfile.id, existingProfile.id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_HERO_PROFILE",
    actionDetails: "Deleted the hero profile",
    ipAddress,
  });
};