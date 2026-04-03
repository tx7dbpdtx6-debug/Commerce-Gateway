import { Router, type IRouter } from "express";
import { eq, desc, sum, count } from "drizzle-orm";
import { db, ordersTable, celebritiesTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  ListOrdersQueryParams,
  ListOrdersResponse,
  GetOrderResponse,
  UpdateOrderStatusResponse,
  GetStatsSummaryResponse,
  GetPopularCelebritiesResponse,
} from "@workspace/api-zod";
import { nanoid } from "../lib/nanoid.js";

const CARD_PRICES: Record<string, number> = {
  basic: 19.99,
  premium: 49.99,
  vip: 99.99,
};

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(ordersTable).$dynamic();
  if (parsed.data.userEmail) {
    query = db.select().from(ordersTable)
      .where(eq(ordersTable.email, parsed.data.userEmail))
      .$dynamic();
  }

  const orders = await query.orderBy(desc(ordersTable.createdAt));
  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));
  res.json(ListOrdersResponse.parse(serialized));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { celebId, cardType, fullName, email, username, phone, shippingAddress, specialMessage } = parsed.data;

  const [celebrity] = await db.select().from(celebritiesTable).where(eq(celebritiesTable.id, celebId));
  if (!celebrity) {
    res.status(404).json({ error: "Celebrity not found" });
    return;
  }

  const price = CARD_PRICES[cardType];
  if (!price) {
    res.status(400).json({ error: "Invalid card type" });
    return;
  }

  const confirmationNumber = `FCH-${nanoid(8).toUpperCase()}`;

  const [order] = await db.insert(ordersTable).values({
    confirmationNumber,
    celebId,
    celebName: celebrity.name,
    cardType,
    price,
    status: "pending",
    fullName,
    email,
    username,
    phone: phone ?? null,
    shippingAddress: shippingAddress ?? null,
    specialMessage: specialMessage ?? null,
  }).returning();

  res.status(201).json(GetOrderResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateOrderStatusParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({
      status: parsed.data.status,
      paymentMethod: parsed.data.paymentMethod ?? null,
      transactionId: parsed.data.transactionId ?? null,
    })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
});

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [celebCount] = await db.select({ count: count() }).from(celebritiesTable);
  const [orderStats] = await db.select({ count: count(), total: sum(ordersTable.price) }).from(ordersTable);

  const summary = {
    totalCelebrities: celebCount.count,
    totalOrders: orderStats.count,
    totalFans: orderStats.count,
    totalRevenue: Number(orderStats.total) || 0,
  };

  res.json(GetStatsSummaryResponse.parse(summary));
});

router.get("/stats/popular", async (_req, res): Promise<void> => {
  const popular = await db
    .select({
      id: celebritiesTable.id,
      name: celebritiesTable.name,
      imageUrl: celebritiesTable.imageUrl,
      category: celebritiesTable.category,
      orderCount: count(ordersTable.id),
    })
    .from(celebritiesTable)
    .leftJoin(ordersTable, eq(ordersTable.celebId, celebritiesTable.id))
    .groupBy(celebritiesTable.id)
    .orderBy(desc(count(ordersTable.id)))
    .limit(8);

  res.json(GetPopularCelebritiesResponse.parse(popular));
});

export default router;
