import { auth } from "@/lib/auth";
import { db } from ".";
import { entries, taccounts, transactions } from "./schema";

async function main() {
  const user = await auth.api.signUpEmail({
    body: {
      email: "m@example.com",
      name: "John Doe",
      password: "12345678",
    },
  });
  console.info("User created");
  const accounts = await db
    .insert(taccounts)
    .values([
      {
        name: "Opening balance",
        normalSide: "cr",
        type: "equity",
        userId: user.user.id,
      },
      {
        name: "Cash",
        normalSide: "dr",
        type: "asset",
        userId: user.user.id,
      },
    ])
    .returning();
  console.info("Accounts added");
  const transaction = await db
    .insert(transactions)
    .values({
      date: new Date(),
      userId: user.user.id,
      description: "Opening balance for cash",
    })
    .returning();
  await db.insert(entries).values([
    {
      amount: 10,
      side: "dr",
      taccountId: accounts.find((ac) => ac.name === "Cash")?.id ?? 0,
      transactionId: transaction[0].id,
    },
    {
      amount: 10,
      side: "cr",
      taccountId: accounts.find((ac) => ac.name === "Opening balance")?.id ?? 0,
      transactionId: transaction[0].id,
    },
  ]);
  console.info("Transaction added");
  console.info("DB Initialized");
}

main();
