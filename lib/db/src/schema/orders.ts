import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  confirmationNumber: text("confirmation_number").notNull().unique(),
  celebId: integer("celeb_id").notNull(),
  celebName: text("celeb_name").notNull(),
  cardType: text("card_type").notNull(),
  price: real("price").notNull(),
  status: text("status").notNull().default("pending"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  phone: text("phone"),
  shippingAddress: text("shipping_address"),
  specialMessage: text("special_message"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
