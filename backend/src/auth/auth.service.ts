import db from "../Drizzle/db.js";
import { admins, registeredAdmins, activityLogs } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const logActivity = async (
  userType: string,
  userIdentifier: string,
  actionType: string,
  actionDetails: string,
  ipAddress: string
) => {
  try {
    await db.insert(activityLogs).values({
      userType,
      userIdentifier,
      actionType,
      actionDetails,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const registerService = async (data: {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  ipAddress: string;
}) => {
  const { email, password, firstName, middleName, lastName, phoneNumber, ipAddress } = data;

  const authorizedEmail = await db.query.admins.findFirst({
    where: eq(admins.email, email),
  });

  if (!authorizedEmail) {
    throw new Error("This email is not authorized to register as an admin.");
  }

  const existingAdmin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });

  if (existingAdmin) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newAdmin] = await db
    .insert(registeredAdmins)
    .values({
      adminEmailId: authorizedEmail.id,
      email,
      passwordHash,
      firstName,
      middleName: middleName || null,
      lastName,
      phoneNumber,
      role: "admin",
      isActive: true,
    })
    .returning();

  await logActivity(
    "admin",
    email,
    "REGISTER",
    `New admin registered: ${firstName} ${lastName}`,
    ipAddress
  );

  return newAdmin;
};

export const loginService = async (email: string, password: string, ipAddress: string) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  if (!admin.isActive) {
    throw new Error("Account is deactivated. Please contact the Super Admin.");
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  await db
    .update(registeredAdmins)
    .set({ lastLogin: new Date() })
    .where(eq(registeredAdmins.id, admin.id));

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );

  await logActivity(
    admin.role,
    admin.email,
    "LOGIN",
    `Admin logged in: ${admin.firstName} ${admin.lastName}`,
    ipAddress
  );

  return {
    token,
    user: {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      middleName: admin.middleName,
      lastName: admin.lastName,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      isActive: admin.isActive,
    },
  };
};

export const forgotPasswordService = async (email: string) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });

  if (!admin) {
    throw new Error("Admin with this email not found");
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  await db
    .update(registeredAdmins)
    .set({ resetCode, resetCodeExpiresAt: expiresAt, isCodeVerified: false })
    .where(eq(registeredAdmins.id, admin.id));

  const html = `
    <h2>Password Reset Code</h2>
    <p>Hello ${admin.firstName},</p>
    <p>You requested to reset your password. Your 6-digit reset code is:</p>
    <h1 style="color: #1565C0; font-size: 32px; background: #f0f4ff; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 5px;">${resetCode}</h1>
    <p>This code will expire in 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(
    email,
    "Password Reset Code - Portfolio Admin",
    `Your password reset code is: ${resetCode}`,
    html
  );
};

export const verifyResetCodeService = async (email: string, code: string) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });

  if (!admin || !admin.resetCode || admin.resetCode !== code) {
    throw new Error("Invalid reset code");
  }

  if (admin.resetCodeExpiresAt && new Date() > admin.resetCodeExpiresAt) {
    throw new Error("Reset code has expired. Please request a new one.");
  }

  await db
    .update(registeredAdmins)
    .set({ isCodeVerified: true })
    .where(eq(registeredAdmins.id, admin.id));

  return true;
};

export const resetPasswordService = async (email: string, newPassword: string) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.email, email),
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  if (!admin.isCodeVerified) {
    throw new Error("You must verify your reset code before changing your password.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(registeredAdmins)
    .set({
      passwordHash,
      isCodeVerified: false,
      resetCode: null,
      resetCodeExpiresAt: null,
    })
    .where(eq(registeredAdmins.id, admin.id));

  await sendEmail(
    admin.email,
    "Password Reset Successful",
    "Your password has been successfully reset.",
    "<h2>Password Reset Successful</h2><p>Your password has been successfully reset.</p>"
  );
};

export const getMeService = async (id: number) => {
  const admin = await db.query.registeredAdmins.findFirst({
    where: eq(registeredAdmins.id, id),
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    middleName: admin.middleName,
    lastName: admin.lastName,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
    isActive: admin.isActive,
    lastLogin: admin.lastLogin,
  };
};