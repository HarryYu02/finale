import { action } from "@solidjs/router";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, taccounts, transactions } from "@/db/schema";
import { assertSession } from ".";

type InsertTAccount = typeof taccounts.$inferInsert;
type InsertTransaction = typeof transactions.$inferInsert;
type InsertEntry = typeof entries.$inferInsert;

export const addTAccountAction = action(
  async (data: Pick<InsertTAccount, "type" | "name" | "amount">) => {
    "use server";
    const session = await assertSession();
    const parsed: InsertTAccount = {
      name: data.name,
      type: data.type,
      normalSide:
        data.type === "asset" || data.type === "expense" ? "dr" : "cr",
      userId: session.user.id,
      amount: data.amount,
    };
    const res = await db.insert(taccounts).values(parsed).returning();
    return res;
  },
  "addTAccount",
);

export const addTransactionAction = action(
  async (data: Pick<InsertTransaction, "date" | "description">) => {
    "use server";
    const session = await assertSession();
    const parsed: InsertTransaction = {
      userId: session.user.id,
      date: data.date,
      description: data.description,
    };
    const res = await db.insert(transactions).values(parsed).returning();
    return res;
  },
  "addTransaction",
);

export const deleteTransactionAction = action(async (id: number) => {
  "use server";
  const session = await assertSession();
  const deleted = await db
    .delete(entries)
    .where(eq(entries.transactionId, id))
    .returning();
  for (let i = 0; i < deleted.length; ++i) {
    const entry = deleted[i];
    await db
      .update(taccounts)
      .set({
        amount: sql`
          CASE
            WHEN ${taccounts.normalSide} = ${entry.side} THEN ${taccounts.amount} - ${entry.amount}
            ELSE ${taccounts.amount} + ${entry.amount}
          END
        `,
      })
      .where(eq(taccounts.id, entry.taccountId));
  }
  const res = await db
    .delete(transactions)
    .where(
      and(eq(transactions.id, id), eq(transactions.userId, session.user.id)),
    )
    .returning();
  return res;
}, "deleteTransaction");

export const addEntryAction = action(async (data: InsertEntry) => {
  "use server";
  const res = await db.insert(entries).values(data).returning();
  await db
    .update(taccounts)
    .set({
      amount: sql`
        CASE
          WHEN ${taccounts.normalSide} = ${data.side} THEN ${taccounts.amount} + ${data.amount}
          ELSE ${taccounts.amount} - ${data.amount}
        END
      `,
    })
    .where(eq(taccounts.id, data.taccountId));
  return res;
}, "addEntry");
