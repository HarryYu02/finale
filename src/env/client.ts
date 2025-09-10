import * as z from "zod";
import { clientScheme } from "./schema";

const env = clientScheme.safeParse(import.meta.env);

if (env.success === false) {
  const pretty = z.prettifyError(env.error);
  console.error("❌ Invalid environment variables:\n", pretty);
  throw new Error("Invalid environment variables");
}

export const clientEnv = env.data;
