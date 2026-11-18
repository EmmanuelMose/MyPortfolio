import { Request, Response } from "express";
import {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getMeService,
} from "./auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, middleName, lastName, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "email, password, firstName, lastName, and phoneNumber are required",
      });
    }

    await registerService({
      email,
      password,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      ipAddress: req.ip || "unknown",
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully. You can now log in.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const data = await loginService(email, password, req.ip || "unknown");
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    await forgotPasswordService(email);
    res.json({ success: true, message: "Password reset link sent to your email" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "token and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    await resetPasswordService(token, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMeController = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user!.id;
    const admin = await getMeService(id);
    res.json({ success: true, data: admin });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};