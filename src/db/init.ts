import { db } from ".";
import { taccounts } from "./schema";

async function main() {
  await db.insert(taccounts).values([
    {
      name: "Grocery",
      normalSide: "dr",
      type: "expense",
    },
  ]);
  console.info("DB Initialized");
}

main();
