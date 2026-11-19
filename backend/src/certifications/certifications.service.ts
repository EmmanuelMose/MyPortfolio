import db from "../Drizzle/db.js";
import { certifications, activityLogs } from "../Drizzle/schema.js";
import { eq, asc } from "drizzle-orm";
import { deleteFromCloudinary, extractPublicId } from "../utils/cloudinaryUpload.js";

export const getAllCertificationsService = async () => {
  const allCerts = await db.query.certifications.findMany({
    orderBy: asc(certifications.displayOrder),
  });
  return allCerts;
};

export const getFeaturedCertificationsService = async () => {
  const featuredCerts = await db.query.certifications.findMany({
    orderBy: asc(certifications.displayOrder),
    limit: 3,
  });
  return featuredCerts;
};

export const getCertificationByIdService = async (id: number) => {
  const cert = await db.query.certifications.findFirst({
    where: eq(certifications.id, id),
  });

  if (!cert) {
    throw new Error("Certification not found");
  }
  return cert;
};

export const createCertificationService = async (
  data: {
    title: string;
    issuer: string;
    description?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const [newCert] = await db
    .insert(certifications)
    .values({
      title: data.title,
      issuer: data.issuer,
      description: data.description || null,
      imageCloudinaryUrl: data.imageCloudinaryUrl || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "CREATE_CERTIFICATION",
    actionDetails: `Created certification: ${newCert.title}`,
    ipAddress,
  });

  return newCert;
};

export const updateCertificationService = async (
  id: number,
  data: {
    title?: string;
    issuer?: string;
    description?: string | null;
    imageCloudinaryUrl?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  },
  adminId: number,
  ipAddress: string
) => {
  const existingCert = await db.query.certifications.findFirst({
    where: eq(certifications.id, id),
  });

  if (!existingCert) {
    throw new Error("Certification not found");
  }

  if (data.imageCloudinaryUrl && existingCert.imageCloudinaryUrl && data.imageCloudinaryUrl !== existingCert.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingCert.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const [updatedCert] = await db
    .update(certifications)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(certifications.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_CERTIFICATION",
    actionDetails: `Updated certification: ${existingCert.title}`,
    ipAddress,
  });

  return updatedCert;
};

export const deleteCertificationService = async (id: number, adminId: number, ipAddress: string) => {
  const existingCert = await db.query.certifications.findFirst({
    where: eq(certifications.id, id),
  });

  if (!existingCert) {
    throw new Error("Certification not found");
  }

  if (existingCert.imageCloudinaryUrl) {
    const publicId = extractPublicId(existingCert.imageCloudinaryUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await db.delete(certifications).where(eq(certifications.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_CERTIFICATION",
    actionDetails: `Deleted certification: ${existingCert.title}`,
    ipAddress,
  });
};