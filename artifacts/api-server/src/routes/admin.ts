import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, usersTable, ordersTable, celebritiesTable, contactMessagesTable } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const ADMIN_EMAIL = "admin@fanCardHub.com";

async function getAdminUserId(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1]): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }

  const token = authHeader.slice(7);
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    res.status(401).json({ error: "Invalid token format" });
    return null;
  }

  const userId = parseInt(token.substring(0, dotIndex), 10);
  if (isNaN(userId)) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user || user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: "Access denied — admin only" });
    return null;
  }

  return userId;
}

router.get("/admin/stats", async (req, res): Promise<void> => {
  const adminId = await getAdminUserId(req, res);
  if (!adminId) return;

  try {
    const users = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    const messages = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));

    const [{ totalCelebs }] = await db.select({ totalCelebs: count() }).from(celebritiesTable);

    const paidOrders = orders.filter(o => o.status === "paid");
    const pendingOrders = orders.filter(o => o.status === "pending");
    const failedOrders = orders.filter(o => o.status === "failed");
    const revenue = paidOrders.reduce((s, o) => s + o.price, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = paidOrders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.price, 0);

    const revenueByTier: Record<string, { count: number; revenue: number }> = {};
    for (const o of paidOrders) {
      const tier = o.cardType || "unknown";
      if (!revenueByTier[tier]) revenueByTier[tier] = { count: 0, revenue: 0 };
      revenueByTier[tier].count++;
      revenueByTier[tier].revenue += o.price;
    }

    const celebSales: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const o of paidOrders) {
      const key = o.celebName;
      if (!celebSales[key]) celebSales[key] = { name: o.celebName, count: 0, revenue: 0 };
      celebSales[key].count++;
      celebSales[key].revenue += o.price;
    }
    const topCelebrities = Object.values(celebSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const revenueByDay: Record<string, number> = {};
    for (const o of paidOrders) {
      const d = new Date(o.createdAt);
      if (d >= last30Days) {
        const key = d.toISOString().split("T")[0];
        revenueByDay[key] = (revenueByDay[key] || 0) + o.price;
      }
    }

    res.json({
      totalUsers: users.filter(u => u.email !== ADMIN_EMAIL).length,
      totalCelebrities: Number(totalCelebs),
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      failedOrders: failedOrders.length,
      totalRevenue: revenue,
      todayRevenue,
      todayOrders: todayOrders.length,
      totalMessages: messages.length,
      revenueByTier,
      topCelebrities,
      revenueByDay,
      users: users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
      orders: orders.map(o => ({
        id: o.id,
        confirmationNumber: o.confirmationNumber,
        celebId: o.celebId,
        celebName: o.celebName,
        cardType: o.cardType,
        price: o.price,
        status: o.status,
        fullName: o.fullName,
        email: o.email,
        username: o.username,
        phone: o.phone,
        shippingAddress: o.shippingAddress,
        specialMessage: o.specialMessage,
        paymentMethod: o.paymentMethod,
        transactionId: o.transactionId,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
      messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
    });
  } catch (err) {
    logger.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

export default router;
