import { pgTable, serial, varchar, text, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin"]);

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  addedBy: integer("added_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registeredAdmins = pgTable("registered_admins", {
  id: serial("id").primaryKey(),
  adminEmailId: integer("admin_email_id").notNull().references(() => admins.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  middleName: varchar("middle_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  role: adminRoleEnum("role").default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  resetCode: varchar("reset_code", { length: 10 }),
  resetCodeExpiresAt: timestamp("reset_code_expires_at"),
  isCodeVerified: boolean("is_code_verified").default(false).notNull(),
});

export const heroProfile = pgTable("hero_profile", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  greeting: varchar("greeting", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  cvCloudinaryUrl: varchar("cv_cloudinary_url", { length: 500 }),
  cvUploadUrl: varchar("cv_upload_url", { length: 500 }),
  profileImageCloudinaryUrl: varchar("profile_image_cloudinary_url", { length: 500 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const heroSkills = pgTable("hero_skills", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platformName: varchar("platform_name", { length: 100 }).notNull(),
  platformIconCloudinaryUrl: varchar("platform_icon_cloudinary_url", { length: 500 }),
  platformIconUrl: varchar("platform_icon_url", { length: 500 }),
  url: varchar("url", { length: 500 }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  liveUrl: varchar("live_url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  techStack: text("tech_stack"),
  displayOrder: integer("display_order").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contact = pgTable("contact", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  message: text("message").notNull(),
  contactMethod: varchar("contact_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const setting = pgTable("setting", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 255 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(),
  degreeOrCourse: varchar("degree_or_course", { length: 255 }).notNull(),
  description: text("description"),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  roleTitle: varchar("role_title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const technologies = pgTable("technologies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityMoments = pgTable("community_moments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  dateOfEvent: varchar("date_of_event", { length: 50 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pictorials = pgTable("pictorials", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageCloudinaryUrl: varchar("image_cloudinary_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resume = pgTable("resume", {
  id: serial("id").primaryKey(),
  fileCloudinaryUrl: varchar("file_cloudinary_url", { length: 500 }),
  fileUrl: varchar("file_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const downloadRequests = pgTable("download_requests", {
  id: serial("id").primaryKey(),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  targetId: integer("target_id"),
  requesterEmail: varchar("requester_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  token: varchar("token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userType: varchar("user_type", { length: 50 }).notNull(),
  userIdentifier: varchar("user_identifier", { length: 255 }),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionDetails: text("action_details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});