import { Router, type IRouter } from "express";
import { ilike, eq, or } from "drizzle-orm";
import { db, celebritiesTable } from "@workspace/db";
import {
  ListCelebritiesQueryParams,
  GetCelebrityParams,
  ListCelebritiesResponse,
  GetCelebrityResponse,
  ListCategoriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/celebrities", async (req, res): Promise<void> => {
  const parsed = ListCelebritiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search } = parsed.data;

  let query = db.select().from(celebritiesTable).$dynamic();

  if (category && category !== "All") {
    query = query.where(eq(celebritiesTable.category, category));
  }

  if (search) {
    const searchCondition = or(
      ilike(celebritiesTable.name, `%${search}%`),
      ilike(celebritiesTable.category, `%${search}%`),
      ilike(celebritiesTable.bio, `%${search}%`)
    );
    if (category && category !== "All") {
      query = db.select().from(celebritiesTable).where(
        or(
          searchCondition,
          eq(celebritiesTable.category, category)
        )
      ).$dynamic();
    } else {
      query = db.select().from(celebritiesTable).where(searchCondition).$dynamic();
    }
  }

  const celebrities = await query.orderBy(celebritiesTable.name);
  const serialized = celebrities.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }));
  res.json(ListCelebritiesResponse.parse(serialized));
});

router.get("/celebrities/:id", async (req, res): Promise<void> => {
  const params = GetCelebrityParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [celebrity] = await db
    .select()
    .from(celebritiesTable)
    .where(eq(celebritiesTable.id, params.data.id));

  if (!celebrity) {
    res.status(404).json({ error: "Celebrity not found" });
    return;
  }

  res.json(GetCelebrityResponse.parse({ ...celebrity, createdAt: celebrity.createdAt.toISOString() }));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const celebrities = await db.select({ category: celebritiesTable.category }).from(celebritiesTable);
  const counts: Record<string, number> = {};
  for (const c of celebrities) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  const result = Object.entries(counts).map(([category, count]) => ({ category, count }));
  res.json(ListCategoriesResponse.parse(result));
});

export default router;
