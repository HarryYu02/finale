import { drizzle } from "drizzle-orm/better-sqlite3";
import { serverEnv } from "@/env/server";

export const db = drizzle(serverEnv.DATABASE_URL);

// const result = await db.run("select 1");
// console.log(result);
