import { action } from "@solidjs/router";
import { db } from "@/db";
import { entries, taccounts, transactions } from "@/db/schema";
import { assertSession } from ".";

type InsertTAccount = typeof taccounts.$inferInsert;
type InsertTransaction = typeof transactions.$inferInsert;
type InsertEntry = typeof entries.$inferInsert;

export const addTAccountAction = action(
  async (data: Pick<InsertTAccount, "type" | "name">) => {
    "use server";
    const session = await assertSession();
    const parsed: InsertTAccount = {
      name: data.name,
      type: data.type,
      normalSide:
        data.type === "asset" || data.type === "expense" ? "dr" : "cr",
      userId: session.user.id,
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

export const addEntryAction = action(async (data: InsertEntry) => {
  "use server";
  const res = await db.insert(entries).values(data).returning();
  return res;
}, "addEntry");
