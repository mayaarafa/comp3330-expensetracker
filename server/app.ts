// server/app.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expenses";

export const app = new Hono();

// Global logger (from Lab 1)
app.use("*", logger());

// Custom timing middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  // Add a response header so we can see timings in curl or other clients
  c.header("X-Response-Time", `${ms}ms`);
});

// Health & root
app.get("/", (c) => c.json({ message: "OK" }));
app.get("/health", (c) => c.json({ status: "healthy" }));

// Mount API routes
app.route("/api/expenses", expensesRoute);
