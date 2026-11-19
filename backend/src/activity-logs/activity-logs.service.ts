import db from "../Drizzle/db.js";
import { activityLogs } from "../Drizzle/schema.js";
import { eq, desc, ne } from "drizzle-orm";

export const getLogsForRoleService = async (role: "super_admin" | "admin") => {
  // Regular admins only see visitor logs; super_admin sees everything
  if (role === "admin") {
    return await db.query.activityLogs.findMany({
      where: eq(activityLogs.userType, "visitor"),
      orderBy: desc(activityLogs.createdAt),
    });
  }
  return await db.query.activityLogs.findMany({
    orderBy: desc(activityLogs.createdAt),
  });
};

export const getVisitorLogsService = async () => {
  return await db.query.activityLogs.findMany({
    where: eq(activityLogs.userType, "visitor"),
    orderBy: desc(activityLogs.createdAt),
  });
};

export const getAdminLogsService = async () => {
  return await db.query.activityLogs.findMany({
    where: ne(activityLogs.userType, "visitor"),
    orderBy: desc(activityLogs.createdAt),
  });
};

export const getLogByIdService = async (id: number) => {
  const found = await db.query.activityLogs.findFirst({
    where: eq(activityLogs.id, id),
  });
  if (!found) throw new Error("Activity log not found");
  return found;
};

export const deleteLogService = async (id: number) => {
  const existing = await db.query.activityLogs.findFirst({
    where: eq(activityLogs.id, id),
  });
  if (!existing) throw new Error("Activity log not found");

  await db.delete(activityLogs).where(eq(activityLogs.id, id));
};

export const deleteAllLogsService = async () => {
  await db.delete(activityLogs);
};