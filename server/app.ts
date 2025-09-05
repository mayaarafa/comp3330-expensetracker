// server/app.ts
import { Hono } from "hono";
import { logger } from "hono/logger";

export const app = new Hono();

// Global middleware
app.use("*", logger());

// Routes
app.get("/", (c) => c.json({ message: "OK" }));
app.get("/health", (c) => c.json({ status: "healthy" }));
app.get("/api/test", (c) => c.json({ message: "test" }));
