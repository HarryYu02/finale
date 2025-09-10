import { defineConfig } from "drizzle-kit";
import { serverEnv } from "@/env/server";

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
