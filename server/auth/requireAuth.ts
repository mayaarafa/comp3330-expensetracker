// server/auth/requireAuth.ts
import type { Context } from "hono";
import { kindeClient, sessionFromHono } from "./kinde";

export async function requireAuth(c: Context) {
  const session = sessionFromHono(c);
  const authed = await kindeClient.isAuthenticated(session);
  if (!authed) return c.json({ error: "Unauthorized" }, 401);
  const user = await kindeClient.getUserProfile(session);
  c.set("user", user);
  return null;
}
