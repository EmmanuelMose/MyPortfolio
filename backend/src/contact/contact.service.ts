import db from "../Drizzle/db.js";
import { contact, activityLogs, setting } from "../Drizzle/schema.js";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "../mailer/mailer.js";

export const createContactService = async (
  data: {
    name: string;
    email: string;
    phoneNumber: string;
    message: string;
    contactMethod: string;
  },
  ipAddress: string
) => {
  const [newContact] = await db
    .insert(contact)
    .values({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      message: data.message,
      contactMethod: data.contactMethod,
      status: "pending",
    })
    .returning();

  // Get super admin email from settings to send notification
  const superAdminEmailSetting = await db.query.setting.findFirst({
    where: eq(setting.settingKey, "super_admin_email"),
  });

  const notifyEmail = superAdminEmailSetting?.settingValue || process.env.EMAIL_USER;

  if (notifyEmail) {
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phoneNumber}</p>
      <p><strong>Method:</strong> ${data.contactMethod}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
      <br/>
      <p>Log in to your admin dashboard to mark this as solved.</p>
    `;

    await sendEmail(
      notifyEmail,
      `New Contact Message from ${data.name}`,
      `New message from ${data.name} (${data.email}): ${data.message}`,
      html
    ).catch((err) => console.error("Failed to send contact notification:", err));
  }

  await db.insert(activityLogs).values({
    userType: "visitor",
    userIdentifier: data.email,
    actionType: "SUBMIT_CONTACT",
    actionDetails: `Contact form submitted by ${data.name} via ${data.contactMethod}`,
    ipAddress,
  });

  return newContact;
};

export const getAllContactsService = async () => {
  return await db.query.contact.findMany({
    orderBy: desc(contact.createdAt),
  });
};

export const getContactByIdService = async (id: number) => {
  const msg = await db.query.contact.findFirst({
    where: eq(contact.id, id),
  });
  if (!msg) throw new Error("Contact message not found");
  return msg;
};

export const updateContactStatusService = async (
  id: number,
  status: "pending" | "solved",
  adminId: number,
  ipAddress: string
) => {
  const existing = await db.query.contact.findFirst({
    where: eq(contact.id, id),
  });

  if (!existing) throw new Error("Contact message not found");

  const [updated] = await db
    .update(contact)
    .set({ status })
    .where(eq(contact.id, id))
    .returning();

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "UPDATE_CONTACT_STATUS",
    actionDetails: `Marked contact #${id} as ${status}`,
    ipAddress,
  });

  return updated;
};

export const deleteContactService = async (id: number, adminId: number, ipAddress: string) => {
  const existing = await db.query.contact.findFirst({
    where: eq(contact.id, id),
  });

  if (!existing) throw new Error("Contact message not found");

  await db.delete(contact).where(eq(contact.id, id));

  await db.insert(activityLogs).values({
    userType: "admin",
    userIdentifier: adminId.toString(),
    actionType: "DELETE_CONTACT",
    actionDetails: `Deleted contact message from ${existing.name}`,
    ipAddress,
  });
};