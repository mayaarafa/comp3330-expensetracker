// server/auth/kinde.ts
import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import {
  createKindeServerClient,
  GrantType,
} from "@kinde-oss/kinde-typescript-sdk";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_ISSUER_URL!,
    clientId: process.env.KINDE_CLIENT_ID!,
    clientSecret: process.env.KINDE_CLIENT_SECRET!,
    redirectURL: process.env.KINDE_REDIRECT_URI!,
    logoutRedirectURL: FRONTEND_URL,
  }
);

// Minimal cookie-backed SessionManager for Hono.
// The SDK will call these to persist state/tokens per session.
export function sessionFromHono(c: any): SessionManager {
  return {
    async getSessionItem(key: string) {
      return getCookie(c, key) ?? null;
    },
    async setSessionItem(key: string, value: unknown) {
      setCookie(c, key, String(value), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    },
    async removeSessionItem(key: string) {
      deleteCookie(c, key);
    },
    async destroySession() {
      for (const k of [
        "access_token",
        "id_token",
        "refresh_token",
        "session",
      ]) {
        deleteCookie(c, k);
      }
    },
  };
}

export const authRoute = new Hono()
  // 1) Start login: get hosted login URL from SDK and redirect
  .get("/login", async (c) => {
    try {
      const session = sessionFromHono(c);
      const url = await kindeClient.login(session);
      return c.redirect(url.toString());
    } catch (e) {
      console.error(
        "[AUTH /login] failed:",
        e instanceof Error ? e.stack ?? e.message : e
      );
      return c.text("Login failed", 500);
    }
  })

  // 2) OAuth callback: hand the full URL to the SDK to validate and store tokens
  .get("/callback", async (c) => {
    const session = sessionFromHono(c);
    await kindeClient.handleRedirectToApp(session, new URL(c.req.url));
    return c.redirect(`${FRONTEND_URL}/expenses`);
  })

  // 3) Logout via SDK: clears SDK-managed session and redirects
  .get("/logout", async (c) => {
    const session = sessionFromHono(c);
    await kindeClient.logout(session);
    return c.redirect(FRONTEND_URL);
  })

  // 4) Current user (profile)
  .get("/me", async (c) => {
    const session = sessionFromHono(c);
    try {
      const profile = await kindeClient.getUserProfile(session);
      return c.json({ user: profile });
    } catch {
      return c.json({ user: null });
    }
  });
