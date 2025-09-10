import "dotenv/config";
import * as z from "zod";
import { serverScheme } from "./schema";

const env = serverScheme.safeParse(process.env);

if (env.success === false) {
  const pretty = z.prettifyError(env.error);
  console.error("❌ Invalid environment variables:\n", pretty);
  throw new Error("Invalid environment variables");
}

export const serverEnv = env.data;
