import { json } from "@solidjs/router";
import type { ResponseMiddleware } from "@solidjs/start/middleware";
import { serverEnv } from "@/env/server";

const TRUSTED_ORIGINS: string[] = [serverEnv.SERVER_URL];

export const cors: ResponseMiddleware = (event) => {
  const { request, response } = event;

  response.headers.append("Vary", "Origin, Access-Control-Request-Method");

  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);
  const isApiRequest = requestUrl?.pathname.startsWith("/api");

  if (isApiRequest && origin && TRUSTED_ORIGINS.includes(origin)) {
    // Handle preflight requests.
    if (
      request.method === "OPTIONS" &&
      request.headers.get("Access-Control-Request-Method")
    ) {
      // Preflight requests are standalone, so we immediately send a response.
      return json(null, {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "OPTIONS, POST, PUT, PATCH, DELETE",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      });
    }

    // Handle normal requests.
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
};
