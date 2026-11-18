import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRouter from "./auth/auth.router.js";
import cloudinaryRouter from "./cloudinary/cloudinary.router.js";

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
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

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
  app.use("/api/cloudinary", cloudinaryRouter);

  return app;
};

const app: express.Express = initializeApp();

export default app;