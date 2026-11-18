import db from "../Drizzle/db.js";
import { heroSkills, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";

export const getAllHeroSkillsService = async () => {
  const skills = await db.query.heroSkills.findMany({
    orderBy: asc(heroSkills.displayOrder),
  });
  return skills;
};

export const createHeroSkillService = async (
  data: {
    title: string;
    displayOrder?: number;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newSkill] = await db
    .insert(heroSkills)
    .values({
      title: data.title,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_HERO_SKILL",
    actionDetails: `Created hero skill: ${newSkill.title}`,
    ipAddress,
  });

  return newSkill;
};

export const updateHeroSkillService = async (
  id: number,
  data: {
    title?: string;
    displayOrder?: number;
    isActive?: boolean;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingSkill = await db.query.heroSkills.findFirst({
    where: eq(heroSkills.id, id),
  });

  if (!existingSkill) {
    throw new Error("Hero skill not found");
  }

  const [updatedSkill] = await db
    .update(heroSkills)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(heroSkills.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_HERO_SKILL",
    actionDetails: `Updated hero skill: ${existingSkill.title}`,
    ipAddress,
  });

  return updatedSkill;
};

export const deleteHeroSkillService = async (id: number, adminId: number, ipAddress: string) => {
  const existingSkill = await db.query.heroSkills.findFirst({
    where: eq(heroSkills.id, id),
  });

  if (!existingSkill) {
    throw new Error("Hero skill not found");
  }

  await db.delete(heroSkills).where(eq(heroSkills.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_HERO_SKILL",
    actionDetails: `Deleted hero skill: ${existingSkill.title}`,
    ipAddress,
  });
};