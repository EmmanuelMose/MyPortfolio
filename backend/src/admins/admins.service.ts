import db from "../Drizzle/db.js";
import { admins, registeredAdmins, setting, activityLogs } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "../mailer/mailer.js";

const logActivity = async (
  userType: string,
  userIdentifier: string,
  actionType: string,
  actionDetails: string,
  ipAddress: string
) => {
  try {
    await db.insert(activityLogs).values({ userType, userIdentifier, actionType, actionDetails, ipAddress });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const listAdminsService = async () => {
  const registered = await db.query.registeredAdmins.findMany();
  const allInvites = await db.query.admins.findMany();
  const registeredEmails = new Set(registered.map((a) => a.email));
  const pendingInvites = allInvites.filter((a) => !registeredEmails.has(a.email));

  return {
    registered,
    pendingInvites,
    totalRegistered: registered.length,
    totalPending: pendingInvites.length,
  };
};

export const getAdminByIdService = async (id: number) => {
  const found = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.id, id),
  });
  if (!found) throw new Error("Admin not found");
  return found;
};

export const inviteAdminService = async (
  email: string,
  inviterId: number,
  ipAddress: string
) => {
  const existingRegistered = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });
  if (existingRegistered) {
    throw new Error("An account with this email already exists.");
  }

  const existingInvite = await db.query.admins.findFirst({
    where: eq(admins.email, email),
  });
  if (existingInvite) {
    throw new Error("This email has already been invited.");
  }

  // Enforce max_admin_limit (registered + pending invites)
  const limitSetting = await db.query.setting.findFirst({
    where: eq(setting.settingKey, "max_admin_limit"),
  });
  const maxLimit = limitSetting ? parseInt(limitSetting.settingValue) : 5;

  const registered = await db.query.registeredAdmins.findMany();
  const allInvites = await db.query.admins.findMany();
  const registeredEmails = new Set(registered.map((a) => a.email));
  const pendingInvites = allInvites.filter((a) => !registeredEmails.has(a.email));

  if (registered.length + pendingInvites.length >= maxLimit) {
    throw new Error(`Maximum admin limit of ${maxLimit} reached.`);
  }

  const [invite] = await db
    .insert(admins)
    .values({ email, addedBy: inviterId })
    .returning();

  const registerLink = `${process.env.ADMIN_FRONTEND_URL}/register`;

  const html = `
    <h2>You've Been Invited as an Admin</h2>
    <p>You have been invited to manage Emmanuel Guru's Portfolio.</p>
    <p>Register using this email: <strong>${email}</strong></p>
    <p><a href="${registerLink}" style="display: inline-block; padding: 12px 24px; background: #1565C0; color: #fff; text-decoration: none; border-radius: 6px;">Register Now</a></p>
    <p>If the button doesn't work, go to: ${registerLink}</p>
  `;

  await sendEmail(
    email,
    "Admin Invitation - Portfolio",
    `You have been invited to be an admin. Register at ${registerLink} using email ${email}`,
    html
  ).catch((err) => console.error("Failed to send invite email:", err));

  await logActivity(
    "super_admin",
    inviterId.toString(),
    "INVITE_ADMIN",
    `Invited new admin: ${email}`,
    ipAddress
  );

  return invite;
};

export const toggleAdminPermissionService = async (
  adminId: number,
  canApproveDownloads: boolean,
  superAdminId: number,
  ipAddress: string
) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.id, adminId),
  });
  if (!admin) throw new Error("Admin not found");
  if (admin.role === "super_admin") {
    throw new Error("Cannot toggle permissions for a Super Admin (they already have all permissions).");
  }

  const [updated] = await db
    .update(registeredAdmins)
    .set({ canApproveDownloads })
    .where(eq(registeredAdmins.id, adminId))
    .returning();

  await logActivity(
    "super_admin",
    superAdminId.toString(),
    canApproveDownloads ? "GRANT_DOWNLOAD_APPROVAL" : "REVOKE_DOWNLOAD_APPROVAL",
    `${canApproveDownloads ? "Granted" : "Revoked"} download approval permission for ${admin.email}`,
    ipAddress
  );

  return updated;
};

export const toggleAdminActiveService = async (
  adminId: number,
  isActive: boolean,
  superAdminId: number,
  ipAddress: string
) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.id, adminId),
  });
  if (!admin) throw new Error("Admin not found");
  if (admin.role === "super_admin") {
    throw new Error("Cannot deactivate a Super Admin.");
  }

  const [updated] = await db
    .update(registeredAdmins)
    .set({ isActive })
    .where(eq(registeredAdmins.id, adminId))
    .returning();

  await logActivity(
    "super_admin",
    superAdminId.toString(),
    isActive ? "ACTIVATE_ADMIN" : "DEACTIVATE_ADMIN",
    `${isActive ? "Activated" : "Deactivated"} admin: ${admin.email}`,
    ipAddress
  );

  return updated;
};

export const deleteAdminService = async (
  adminId: number,
  superAdminId: number,
  ipAddress: string
) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.id, adminId),
  });
  if (!admin) throw new Error("Admin not found");
  if (admin.role === "super_admin") {
    throw new Error("Cannot delete a Super Admin.");
  }

  await db.delete(registeredAdmins).where(eq(registeredAdmins.id, adminId));

  await logActivity(
    "super_admin",
    superAdminId.toString(),
    "DELETE_ADMIN",
    `Deleted admin: ${admin.email}`,
    ipAddress
  );

  return { deleted: true, email: admin.email };
};

export const deleteInviteService = async (
  inviteId: number,
  superAdminId: number,
  ipAddress: string
) => {
  const invite = await db.query.admins.findFirst({
    where: eq(admins.id, inviteId),
  });
  if (!invite) throw new Error("Invite not found");

  await db.delete(admins).where(eq(admins.id, inviteId));

  await logActivity(
    "super_admin",
    superAdminId.toString(),
    "DELETE_INVITE",
    `Deleted pending invite: ${invite.email}`,
    ipAddress
  );

  return { deleted: true, email: invite.email };
};