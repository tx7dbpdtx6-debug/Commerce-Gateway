import { Router, type IRouter } from "express";
import { eq, desc, count, sum } from "drizzle-orm";
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
    const revenue = paidOrders.reduce((s, o) => s + o.price, 0);

    res.json({
      totalUsers: users.length,
      totalCelebrities: Number(totalCelebs),
      totalOrders: orders.length,
      totalRevenue: revenue,
      totalMessages: messages.length,
      users: users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
      orders: orders.map(o => ({
        ...o,
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
