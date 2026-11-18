import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../Drizzle/db.js";
import { registeredAdmins } from "../Drizzle/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "super_admin" | "admin";
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        email: string;
        role: "super_admin" | "admin";
      };

      const admin = await db.query.registeredAdmins.findFirst({
        where: eq(registeredAdmins.id, decoded.id),
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin account no longer exists",
        });
      }

      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: "Admin account has been deactivated",
        });
      }

      req.user = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      };

      next();
    } catch (jwtError: any) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
    }

    next();
  };
};