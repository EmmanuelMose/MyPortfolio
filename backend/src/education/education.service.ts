import db from "../Drizzle/db.js";
import { education, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllEducationService = async () => {
  return await db.query.education.findMany({
    orderBy: asc(education.displayOrder),
  });
};

export const getEducationByIdService = async (id: number) => {
  const edu = await db.query.education.findFirst({
    where: eq(education.id, id),
  });
  if (!edu) throw new Error("Education record not found");
  return edu;
};

export const createEducationService = async (
  data: {
    institutionName: string;
    degreeOrCourse: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newEdu] = await db
    .insert(education)
    .values({
      institutionName: data.institutionName,
      degreeOrCourse: data.degreeOrCourse,
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_EDUCATION",
    actionDetails: `Created education record: ${newEdu.institutionName}`,
    ipAddress,
  });

  return newEdu;
};

export const updateEducationService = async (
  id: number,
  data: {
    institutionName?: string;
    degreeOrCourse?: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingEdu = await db.query.education.findFirst({
    where: eq(education.id, id),
  });

  if (!existingEdu) throw new Error("Education record not found");

  if (data.imageCloudinaryUrl && existingEdu.imageCloudinaryUrl && data.imageCloudinaryUrl !== existingEdu.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingEdu.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updatedEdu] = await db
    .update(education)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(education.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_EDUCATION",
    actionDetails: `Updated education record: ${existingEdu.institutionName}`,
    ipAddress,
  });

  return updatedEdu;
};

export const deleteEducationService = async (id: number, adminId: number, ipAddress: string) => {
  const existingEdu = await db.query.education.findFirst({
    where: eq(education.id, id),
  });

  if (!existingEdu) throw new Error("Education record not found");

  if (existingEdu.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingEdu.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(education).where(eq(education.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_EDUCATION",
    actionDetails: `Deleted education record: ${existingEdu.institutionName}`,
    ipAddress,
  });
};