import { createMiddleware } from "@solidjs/start/middleware";
import { cors } from "./cors";
import { csp } from "./csp";
import { csrf } from "./csrf";

export default createMiddleware({
  onRequest: [csp, csrf],
  onBeforeResponse: [cors],
});
