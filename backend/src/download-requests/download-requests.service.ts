import crypto from "crypto";
import db from "../Drizzle/db.js";
import {
  downloadRequests,
  activityLogs,
  heroProfile,
  resume,
  certifications,
  setting,
} from "../Drizzle/schema.js";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "../mailer/mailer.js";

const VALID_REQUEST_TYPES = ["CV", "RESUME", "CERTIFICATION"];

export const createDownloadRequestService = async (
  data: {
    requestType: string;
    targetId?: number | null;
    requesterEmail: string;
  },
  ipAddress: string
) => {
  if (!VALID_REQUEST_TYPES.includes(data.requestType)) {
    throw new Error(`requestType must be one of: ${VALID_REQUEST_TYPES.join(", ")}`);
  }

  if (data.requestType === "CERTIFICATION" && !data.targetId) {
    throw new Error("targetId (certification ID) is required when requestType is CERTIFICATION");
  }

  // NEW: check if downloads are globally enabled
  const enabledSetting = await db.query.setting.findFirst({
    where: eq(setting.settingKey, "downloads_enabled"),
  });
  if (!enabledSetting || enabledSetting.settingValue !== "true") {
    throw new Error("Downloads are currently disabled. Please try again later.");
  }

  const existing = await db.query.downloadRequests.findFirst({
    where: (req, { and, eq }) =>
      and(
        eq(req.requesterEmail, data.requesterEmail),
        eq(req.requestType, data.requestType),
        eq(req.status, "PENDING")
      ),
  });

  if (existing) {
    throw new Error("You already have a pending request for this resource. Please wait for approval.");
  }

  const [newRequest] = await db
    .insert(downloadRequests)
    .values({
      requestType: data.requestType,
      targetId: data.targetId ?? null,
      requesterEmail: data.requesterEmail,
      status: "PENDING",
    })
    .returning();

  const superAdminEmailSetting = await db.query.setting.findFirst({
    where: eq(setting.settingKey, "super_admin_email"),
  });
  const notifyEmail = superAdminEmailSetting?.settingValue || process.env.EMAIL_USER;

  if (notifyEmail) {
    const html = `
      <h2>New Download Request</h2>
      <p><strong>Type:</strong> ${data.requestType}</p>
      <p><strong>Target ID:</strong> ${data.targetId ?? "N/A"}</p>
      <p><strong>Requester Email:</strong> ${data.requesterEmail}</p>
      <p>Log in to the admin dashboard to approve or reject this request.</p>
    `;
    await sendEmail(
      notifyEmail,
      `Download Request: ${data.requestType}`,
      `New ${data.requestType} download request from ${data.requesterEmail}`,
      html
    ).catch((err) => console.error("Failed to notify super admin:", err));
  }

  await db.insert(activityLogs).values({
    userType: "visitor",
    userIdentifier: data.requesterEmail,
    actionType: "REQUEST_DOWNLOAD",
    actionDetails: `Requested download: ${data.requestType} (target: ${data.targetId ?? "N/A"})`,
    ipAddress,
  });

  return newRequest;
};

export const getAllDownloadRequestsService = async () => {
  return await db.query.downloadRequests.findMany({ orderBy: desc(downloadRequests.createdAt) });
};

export const getDownloadRequestByIdService = async (id: number) => {
  const found = await db.query.downloadRequests.findFirst({
    where: eq(downloadRequests.id, id),
  });
  if (!found) throw new Error("Download request not found");
  return found;
};

const resolveFileUrl = async (requestType: string, targetId: number | null) => {
  if (requestType === "CV") {
    const profile = await db.query.heroProfile.findFirst();
    if (!profile) throw new Error("Hero profile not found");
    const url = profile.cvCloudinaryUrl || profile.cvUploadUrl;
    if (!url) throw new Error("CV not available");
    return url;
  }

  if (requestType === "RESUME") {
    const resumeRecord = await db.query.resume.findFirst();
    if (!resumeRecord) throw new Error("Resume not found");
    const url = resumeRecord.fileCloudinaryUrl || resumeRecord.fileUrl;
    if (!url) throw new Error("Resume not available");
    return url;
  }

  if (requestType === "CERTIFICATION") {
    if (!targetId) throw new Error("targetId is required for CERTIFICATION");
    const cert = await db.query.certifications.findFirst({
      where: eq(certifications.id, targetId),
    });
    if (!cert) throw new Error("Certification not found");
    const url = cert.imageCloudinaryUrl || cert.imageUrl;
    if (!url) throw new Error("Certification file not available");
    return url;
  }

  throw new Error("Invalid requestType");
};

export const approveDownloadRequestService = async (
  id: number,
  adminId: number,
  ipAddress: string
) => {
  const request = await db.query.downloadRequests.findFirst({
    where: eq(downloadRequests.id, id),
  });
  if (!request) throw new Error("Download request not found");
  if (request.status !== "PENDING") throw new Error(`Request is already ${request.status}`);

  await resolveFileUrl(request.requestType, request.targetId);

  const token = crypto.randomBytes(32).toString("hex");

  const [updated] = await db
    .update(downloadRequests)
    .set({ status: "APPROVED", token, updatedAt: new Date() })
    .where(eq(downloadRequests.id, id))
    .returning();

  const downloadLink = `${process.env.PUBLIC_FRONTEND_URL}/api/download-requests/download/${token}`;

  const html = `
    <h2>Your Download Is Approved</h2>
    <p>Your request for <strong>${request.requestType}</strong> has been approved.</p>
    <p>Click the link below to download:</p>
    <p><a href="${downloadLink}" style="display: inline-block; padding: 12px 24px; background: #1565C0; color: #fff; text-decoration: none; border-radius: 6px;">Download Now</a></p>
    <p>If the button doesn't work, copy this URL:</p>
    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${downloadLink}</p>
    <p>Note: This link can only be used once.</p>
  `;

  await sendEmail(
    request.requesterEmail,
    `Your ${request.requestType} Download Is Approved`,
    `Your request has been approved. Download here: ${downloadLink}`,
    html
  ).catch((err) => console.error("Failed to email download link:", err));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "APPROVE_DOWNLOAD",
    actionDetails: `Approved download request #${id} (${request.requestType}) for ${request.requesterEmail}`,
    ipAddress,
  });

  return updated;
};

export const rejectDownloadRequestService = async (
  id: number,
  adminId: number,
  ipAddress: string
) => {
  const request = await db.query.downloadRequests.findFirst({
    where: eq(downloadRequests.id, id),
  });
  if (!request) throw new Error("Download request not found");
  if (request.status !== "PENDING") throw new Error(`Request is already ${request.status}`);

  const [updated] = await db
    .update(downloadRequests)
    .set({ status: "REJECTED", updatedAt: new Date() })
    .where(eq(downloadRequests.id, id))
    .returning();

  // NEW: notify requester of rejection
  const html = `
    <h2>Your Download Request Was Declined</h2>
    <p>Unfortunately, your request for <strong>${request.requestType}</strong> was not approved at this time.</p>
    <p>If you believe this was a mistake, please contact Emmanuel directly.</p>
  `;

  await sendEmail(
    request.requesterEmail,
    `Your ${request.requestType} Download Request Was Declined`,
    `Your request for ${request.requestType} was declined.`,
    html
  ).catch((err) => console.error("Failed to email rejection:", err));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "REJECT_DOWNLOAD",
    actionDetails: `Rejected download request #${id} (${request.requestType}) for ${request.requesterEmail}`,
    ipAddress,
  });

  return updated;
};

export const downloadByTokenService = async (token: string, ipAddress: string) => {
  const request = await db.query.downloadRequests.findFirst({
    where: eq(downloadRequests.token, token),
  });

  if (!request) throw new Error("Invalid or unknown download token");
  if (request.status !== "APPROVED") throw new Error(`Request is ${request.status}, not available for download`);

  const fileUrl = await resolveFileUrl(request.requestType, request.targetId);

  await db
    .update(downloadRequests)
    .set({ status: "USED", updatedAt: new Date() })
    .where(eq(downloadRequests.id, request.id));

  await db.insert(activityLogs).values({
    userType: "visitor",
    userIdentifier: request.requesterEmail,
    actionType: "DOWNLOAD_FILE",
    actionDetails: `Downloaded ${request.requestType} via token`,
    ipAddress,
  });

  return { fileUrl, requestType: request.requestType };
};

export const deleteDownloadRequestService = async (id: number, adminId: number, ipAddress: string) => {
  const existing = await db.query.downloadRequests.findFirst({
    where: eq(downloadRequests.id, id),
  });
  if (!existing) throw new Error("Download request not found");

  await db.delete(downloadRequests).where(eq(downloadRequests.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_DOWNLOAD_REQUEST",
    actionDetails: `Deleted download request #${id} (${existing.requestType})`,
    ipAddress,
  });
};