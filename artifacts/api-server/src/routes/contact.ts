import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { sendContactConfirmation } from "../lib/email.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    await db.insert(contactMessagesTable).values({ name, email, subject, message });

    sendContactConfirmation({ to: email, name }).catch((err) =>
      logger.error({ err }, "Failed to send contact confirmation email")
    );

    res.json({ success: true, message: "Message received! We'll reply via WhatsApp soon." });
  } catch (err) {
    logger.error({ err }, "Contact form error");
    res.status(500).json({ error: "Failed to save message" });
  }
});

export default router;
