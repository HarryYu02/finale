import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { parseSetCookieHeader } from "better-auth/cookies";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  telemetry: { enabled: false },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const returned = ctx.context.responseHeaders;
      if ("_flag" in ctx && ctx._flag === "router") {
        return;
      }
      if (returned instanceof Headers) {
        const setCookies = returned?.get("set-cookie");
        if (!setCookies) return;
        const parsed = parseSetCookieHeader(setCookies);

        const { setCookie } = await import("vinxi/http");
        parsed.forEach((value, key) => {
          if (!key) return;
          const opts = {
            sameSite: value.samesite,
            secure: value.secure,
            maxAge: value["max-age"],
            httpOnly: value.httponly,
            domain: value.domain,
            path: value.path,
          } as const;
          try {
            setCookie(key, decodeURIComponent(value.value), opts);
          } catch (e) {
            // this will fail if the cookie is being set on server component
            console.error(e);
          }
        });
        return;
      }
    }),
  },
});
