import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const celebritiesTable = pgTable("celebrities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  nationality: text("nationality"),
  popularFor: text("popular_for"),
  fanCount: integer("fan_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCelebritySchema = createInsertSchema(celebritiesTable).omit({ id: true, createdAt: true });
export type InsertCelebrity = z.infer<typeof insertCelebritySchema>;
export type Celebrity = typeof celebritiesTable.$inferSelect;
