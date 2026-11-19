import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRouter from "./auth/auth.router.js";
import cloudinaryRouter from "./cloudinary/cloudinary.router.js";
import heroProfileRouter from "./hero-profile/hero-profile.router.js";
import heroSkillsRouter from "./hero-skills/hero-skills.router.js";
import socialLinksRouter from "./social-links/social-links.router.js";
import projectsRouter from "./projects/projects.router.js";
import certificationsRouter from "./certifications/certifications.router.js";
import contactRouter from "./contact/contact.router.js";
import settingsRouter from "./settings/settings.router.js";
import educationRouter from "./education/education.router.js";
import experienceRouter from "./experience/experience.router.js";
import technologiesRouter from "./technologies/technologies.router.js";
import communityMomentsRouter from "./community-moments/community-moments.router.js";
import pictorialsRouter from "./pictorials/pictorials.router.js";
import resumeRouter from "./resume/resume.router.js";
import downloadRequestsRouter from "./download-requests/download-requests.router.js";
import activityLogsRouter from "./activity-logs/activity-logs.router.js";
import adminsRouter from "./admins/admins.router.js";

const initializeApp = () => {
  const app = express();

  app.use(express.json());

  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.PUBLIC_FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.log("Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.options("/{*splat}", cors());

  app.get("/", (_req, res) => {
    res.send("Emmanuel Guru Portfolio Backend running successfully!");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admins", adminsRouter);
  app.use("/api/cloudinary", cloudinaryRouter);
  app.use("/api/hero-profile", heroProfileRouter);
  app.use("/api/hero-skills", heroSkillsRouter);
  app.use("/api/social-links", socialLinksRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/certifications", certificationsRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/education", educationRouter);
  app.use("/api/experience", experienceRouter);
  app.use("/api/technologies", technologiesRouter);
  app.use("/api/community-moments", communityMomentsRouter);
  app.use("/api/pictorials", pictorialsRouter);
  app.use("/api/resume", resumeRouter);
  app.use("/api/download-requests", downloadRequestsRouter);
  app.use("/api/activity-logs", activityLogsRouter);

  return app;
};

const app: express.Express = initializeApp();

export default app;