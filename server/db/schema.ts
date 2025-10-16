// server/db/schema.ts
import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  fileUrl: varchar("file_url", { length: 500 }), // stores the S3 key or null
});
