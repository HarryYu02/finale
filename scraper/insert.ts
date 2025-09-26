import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";
import { db } from "@/db";
import { stockPrices } from "@/db/schema";

async function main() {
  const ticker = process.argv[3];
  const currency = process.argv[4];
  const price = Math.round(Number(process.argv[5]) * 100);
  const provider = process.argv[6];

  const schema = createInsertSchema(stockPrices);

  const parsed = schema.safeParse({
    ticker,
    currency,
    price,
    provider,
  });

  if (parsed.success) {
    const res = await db.insert(stockPrices).values(parsed.data).returning();
    console.log(res);
  } else {
    const error = z.prettifyError(parsed.error);
    console.error(error);
  }
}

main();
