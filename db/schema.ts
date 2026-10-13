import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const memories = sqliteTable("memories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  theme: text("theme").notNull().default("red"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
