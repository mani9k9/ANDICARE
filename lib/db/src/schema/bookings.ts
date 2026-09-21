import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey(),
  customerKey: text("customer_key").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  status: text("status").notNull().default("Booking requested"),
  partner: text("partner").notNull().default("Partner selection pending"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  address: text("address").notNull(),
  method: text("method").notNull(),
  area: text("area").notNull().default("Indore"),
  price: integer("price").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;