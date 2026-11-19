import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createContactController,
  getAllContactsController,
  getContactByIdController,
  updateContactStatusController,
  deleteContactController,
} from "./contact.controller.js";

const contactRouter = Router();

// Public Route (no auth required to submit a contact form)
contactRouter.post("/", createContactController);

// Protected Routes (Admin & Super Admin)
contactRouter.get("/", authenticate, authorize("super_admin", "admin"), getAllContactsController);
contactRouter.get("/:id", authenticate, authorize("super_admin", "admin"), getContactByIdController);
contactRouter.patch("/:id/status", authenticate, authorize("super_admin", "admin"), updateContactStatusController);
contactRouter.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteContactController);

export default contactRouter;