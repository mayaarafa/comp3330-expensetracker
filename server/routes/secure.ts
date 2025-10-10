// server/routes/secure.ts
import { Hono } from "hono";
import { requireAuth } from "../auth/requireAuth";

type AppEnv = {
  Variables: {
    user: {
      id: string;
      email?: string;
      name?: string;
    };
  };
};

export const secureRoute = new Hono<AppEnv>().get("/profile", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const user = c.get("user");
  return c.json({ user });
});
