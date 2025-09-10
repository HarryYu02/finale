import * as z from "zod";

export const serverScheme = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  SERVER_URL: z.string(),
});

export const clientScheme = z.object({
  MODE: z.enum(["development", "production", "test"]).default("development"),
});
