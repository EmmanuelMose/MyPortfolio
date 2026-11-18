import { Router } from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  verifyResetCodeController,
  resetPasswordController,
  getMeController,
} from "./auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/verify-reset-code", verifyResetCodeController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.get("/me", authenticate, getMeController);

export default authRouter;