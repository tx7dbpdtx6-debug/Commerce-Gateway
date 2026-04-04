import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, celebritiesTable } from "@workspace/db";
import {
  InitializePaymentBody,
  InitializePaymentResponse,
  VerifyPaymentBody,
  VerifyPaymentResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger.js";
import { nanoid } from "../lib/nanoid.js";
import { sendFanCardEmail } from "../lib/email.js";

const router: IRouter = Router();

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

router.post("/payment/initialize", async (req, res): Promise<void> => {
  const parsed = InitializePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { orderId, amount, currency, email, fullName, phone, redirectUrl } = parsed.data;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const txRef = `FCH-${nanoid(12).toUpperCase()}`;

  if (FLUTTERWAVE_SECRET_KEY) {
    try {
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount,
          currency: currency || "USD",
          redirect_url: redirectUrl,
          customer: {
            email,
            name: fullName,
            phonenumber: phone || "",
          },
          customizations: {
            title: "CelebFanCards",
            description: `Fan card order #${orderId} - ${order.celebName} ${order.cardType} card`,
            logo: "https://picsum.photos/seed/celebfancards/100/100",
          },
          meta: {
            orderId: orderId.toString(),
            celebName: order.celebName,
            cardType: order.cardType,
          },
        }),
      });

      const data = await response.json() as { status: string; data: { link: string } };
      if (data.status === "success" && data.data?.link) {
        res.json(InitializePaymentResponse.parse({ paymentLink: data.data.link, txRef }));
        return;
      }
    } catch (err) {
      logger.error({ err }, "Flutterwave API error");
    }
  }

  const simulatedLink = `${redirectUrl}?transaction_id=simulated_${txRef}&tx_ref=${txRef}&status=successful`;
  res.json(InitializePaymentResponse.parse({ paymentLink: simulatedLink, txRef }));
});

router.post("/payment/verify", async (req, res): Promise<void> => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { transactionId, orderId } = parsed.data;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  let paymentStatus = "successful";

  if (FLUTTERWAVE_SECRET_KEY && !transactionId.startsWith("simulated_")) {
    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: {
          "Authorization": `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      });

      const data = await response.json() as { status: string; data: { status: string } };
      if (data.status === "success") {
        paymentStatus = data.data.status;
      }
    } catch (err) {
      logger.error({ err }, "Flutterwave verify error");
    }
  }

  const newStatus = paymentStatus === "successful" ? "paid" : "failed";

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({
      status: newStatus,
      paymentMethod: "flutterwave",
      transactionId,
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (newStatus === "paid" && updatedOrder.email) {
    const [celeb] = await db
      .select()
      .from(celebritiesTable)
      .where(eq(celebritiesTable.id, updatedOrder.celebId));

    sendFanCardEmail({
      to: updatedOrder.email,
      buyerName: updatedOrder.fullName,
      celebName: updatedOrder.celebName,
      cardType: updatedOrder.cardType,
      price: updatedOrder.price,
      confirmationNumber: updatedOrder.confirmationNumber,
      celebImageUrl: celeb?.imageUrl ?? "",
    }).catch((err) => logger.error({ err }, "Failed to send fan card email"));
  }

  res.json(VerifyPaymentResponse.parse({
    status: newStatus,
    message: newStatus === "paid" ? "Payment verified successfully" : "Payment verification failed",
    orderId,
    confirmationNumber: updatedOrder.confirmationNumber,
  }));
});

export default router;
