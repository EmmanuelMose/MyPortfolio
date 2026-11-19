import db from "../Drizzle/db.js";
import { setting, activityLogs } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";

const PUBLIC_SETTING_KEYS = ["super_admin_whatsapp", "site_title", "footer_copyright"];

export const getAllSettingsService = async () => {
  return await db.query.setting.findMany();
};

export const getPublicSettingsService = async () => {
  const all = await db.query.setting.findMany();
  return all.filter((s) => PUBLIC_SETTING_KEYS.includes(s.settingKey));
};

export const getSettingByKeyService = async (key: string) => {
  const found = await db.query.setting.findFirst({
    where: eq(setting.settingKey, key),
  });
  if (!found) throw new Error(`Setting '${key}' not found`);
  return found;
};

export const upsertSettingService = async (
  key: string,
  value: string,
  adminId: number,
  ipAddress: string
) => {
  const [result] = await db
    .insert(setting)
    .values({ settingKey: key, settingValue: value })
    .onConflictDoUpdate({
      target: setting.settingKey,
      set: { settingValue: value },
    })
    .returning();

  await db.insert(activityLogs).values({
    userType: "super_admin",
    userIdentifier: adminId.toString(),
    actionType: "UPSERT_SETTING",
    actionDetails: `Upserted setting: ${key}`,
    ipAddress,
  });

  return result;
};

export const bulkUpdateSettingsService = async (
  settings: { key: string; value: string }[],
  adminId: number,
  ipAddress: string
) => {
  const results = [];
  for (const item of settings) {
    if (!item.key || item.value === undefined) continue;
    const [result] = await db
      .insert(setting)
      .values({ settingKey: item.key, settingValue: String(item.value) })
      .onConflictDoUpdate({
        target: setting.settingKey,
        set: { settingValue: String(item.value) },
      })
      .returning();
    results.push(result);
  }

  await db.insert(activityLogs).values({
    userType: "super_admin",
    userIdentifier: adminId.toString(),
    actionType: "BULK_UPDATE_SETTINGS",
    actionDetails: `Bulk updated ${results.length} settings`,
    ipAddress,
  });

  return results;
};

export const deleteSettingService = async (key: string, adminId: number, ipAddress: string) => {
  const existing = await db.query.setting.findFirst({
    where: eq(setting.settingKey, key),
  });

  if (!existing) throw new Error(`Setting '${key}' not found`);

  await db.delete(setting).where(eq(setting.settingKey, key));

  await db.insert(activityLogs).values({
    userType: "super_admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_SETTING",
    actionDetails: `Deleted setting: ${key}`,
    ipAddress,
  });
};