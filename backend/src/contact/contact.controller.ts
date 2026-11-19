import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createContactService,
  getAllContactsService,
  getContactByIdService,
  updateContactStatusService,
  deleteContactService,
} from "./contact.service.js";

export const createContactController = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, message, contactMethod } = req.body;

    if (!name || !email || !phoneNumber || !message || !contactMethod) {
      return res.status(400).json({
        success: false,
        message: "name, email, phoneNumber, message, and contactMethod are required",
      });
    }

    if (contactMethod !== "email" && contactMethod !== "whatsapp") {
      return res.status(400).json({
        success: false,
        message: "contactMethod must be 'email' or 'whatsapp'",
      });
    }

    const newContact = await createContactService(
      { name, email, phoneNumber, message, contactMethod },
      req.ip || "unknown"
    );

    res.status(201).json({
      success: true,
      data: newContact,
      message: "Message received. We will get back to you shortly.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllContactsController = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await getAllContactsService();
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getContactByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid contact ID" });

    const msg = await getContactByIdService(id);
    res.json({ success: true, data: msg });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateContactStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { status } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid contact ID" });

    if (status !== "pending" && status !== "solved") {
      return res.status(400).json({
        success: false,
        message: "status must be 'pending' or 'solved'",
      });
    }

    const updated = await updateContactStatusService(
      id,
      status,
      req.user!.id,
      req.ip || "unknown"
    );

    res.json({ success: true, data: updated, message: `Message marked as ${status}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteContactController = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid contact ID" });

    await deleteContactService(id, req.user!.id, req.ip || "unknown");
    res.json({ success: true, message: "Contact message deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};