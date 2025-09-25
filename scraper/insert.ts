import { db } from "@/db";
import { stockPrices } from "@/db/schema";

async function main() {
  const ticker = process.argv[3];
  const currency = process.argv[4];
  const price = Math.round(Number(process.argv[5]) * 100);

  const res = await db
    .insert(stockPrices)
    .values({
      ticker,
      currency,
      price,
    })
    .returning();

  console.log(res);
}

main();
