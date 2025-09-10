import { json } from "@solidjs/router";
import type { RequestMiddleware } from "@solidjs/start/middleware";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];
const TRUSTED_ORIGINS: string[] = [];

export const csrf: RequestMiddleware = (event) => {
  const { request } = event;

  if (!SAFE_METHODS.includes(request.method)) {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("Origin");

    // If we have an Origin header, check it against our allowlist.
    if (origin) {
      const parsedOrigin = new URL(origin);

      if (
        parsedOrigin.origin !== requestUrl.origin &&
        !TRUSTED_ORIGINS.includes(parsedOrigin.host)
      ) {
        return json({ error: "origin invalid" }, { status: 403 });
      }
    }

    // If we are serving via TLS and have no Origin header, prevent against
    // CSRF via HTTP man-in-the-middle attacks by enforcing strict Referer
    // origin checks.
    if (!origin && requestUrl.protocol === "https:") {
      const referer = request.headers.get("Referer");

      if (!referer) {
        return json({ error: "referer not supplied" }, { status: 403 });
      }

      const parsedReferer = new URL(referer);

      if (parsedReferer.protocol !== "https:") {
        return json({ error: "referer invalid" }, { status: 403 });
      }

      if (
        parsedReferer.host !== requestUrl.host &&
        !TRUSTED_ORIGINS.includes(parsedReferer.host)
      ) {
        return json({ error: "referer invalid" }, { status: 403 });
      }
    }
  }
};
