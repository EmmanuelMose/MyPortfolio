import db from "../Drizzle/db.js";
import { experience, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";

export const getAllExperienceService = async () => {
  return await db.query.experience.findMany({
    orderBy: asc(experience.displayOrder),
  });
};

export const getExperienceByIdService = async (id: number) => {
  const exp = await db.query.experience.findFirst({
    where: eq(experience.id, id),
  });
  if (!exp) throw new Error("Experience record not found");
  return exp;
};

export const createExperienceService = async (
  data: {
    companyName: string;
    roleTitle: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newExp] = await db
    .insert(experience)
    .values({
      companyName: data.companyName,
      roleTitle: data.roleTitle,
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_EXPERIENCE",
    actionDetails: `Created experience: ${newExp.companyName} - ${newExp.roleTitle}`,
    ipAddress,
  });

  return newExp;
};

export const updateExperienceService = async (
  id: number,
  data: {
    companyName?: string;
    roleTitle?: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingExp = await db.query.experience.findFirst({
    where: eq(experience.id, id),
  });

  if (!existingExp) throw new Error("Experience record not found");

  const [updatedExp] = await db
    .update(experience)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(experience.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_EXPERIENCE",
    actionDetails: `Updated experience: ${existingExp.companyName} - ${existingExp.roleTitle}`,
    ipAddress,
  });

  return updatedExp;
};

export const deleteExperienceService = async (id: number, adminId: number, ipAddress: string) => {
  const existingExp = await db.query.experience.findFirst({
    where: eq(experience.id, id),
  });

  if (!existingExp) throw new Error("Experience record not found");

  await db.delete(experience).where(eq(experience.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_EXPERIENCE",
    actionDetails: `Deleted experience: ${existingExp.companyName} - ${existingExp.roleTitle}`,
    ipAddress,
  });
};