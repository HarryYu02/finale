import { query, redirect } from "@solidjs/router";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getRequestEvent } from "solid-js/web";
import { db } from "@/db";
import { entries, taccounts, transactions } from "@/db/schema";
import { auth } from "@/lib/auth";

export const assertSession = query(async (redir: string = "/") => {
  "use server";
  const event = getRequestEvent();
  if (!event) throw redirect(redir);
  const session = await auth.api.getSession({
    headers: event?.request.headers,
  });
  if (!session) throw redirect(redir);
  return session;
}, "assertSession");

export const getAccounts = query(async () => {
  "use server";
  const session = await assertSession();
  const accounts = await db
    .select()
    .from(taccounts)
    .where(eq(taccounts.userId, session.user.id));
  return accounts;
}, "getAccounts");

export const getEntries = query(async () => {
  "use server";
  const session = await assertSession();
  const allEntries = await db
    .select()
    .from(entries)
    .leftJoin(transactions, eq(entries.transactionId, transactions.id))
    .leftJoin(taccounts, eq(entries.taccountId, taccounts.id))
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(entries.side));
  return allEntries;
}, "getEntries");

export const getNetWorth = query(async () => {
  "use server";
  const session = await assertSession();
  const allUserAssetsLiabilities = await db
    .select()
    .from(taccounts)
    .where(
      and(
        eq(taccounts.userId, session.user.id),
        inArray(taccounts.type, ["asset", "liability"]),
      ),
    );
  return (
    allUserAssetsLiabilities.reduce(
      (acc, cur) =>
        cur.type === "asset" ? acc + cur.amount : acc - cur.amount,
      0,
    ) / 100
  );
}, "getNetWorth");

export const getIncomeExpense = query(async () => {
  "use server";
  const session = await assertSession();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const allUserIncomeExpenceInMonth = await db
    .select()
    .from(entries)
    .leftJoin(taccounts, eq(entries.taccountId, taccounts.id))
    .leftJoin(transactions, eq(entries.transactionId, transactions.id))
    .where(
      and(
        eq(taccounts.userId, session.user.id),
        sql`cast(strftime('%Y', ${transactions.date}, 'unixepoch') as integer) = ${year}`,
        sql`cast(strftime('%m', ${transactions.date}, 'unixepoch') as integer) = ${month}`,
        inArray(taccounts.type, ["income", "expense"]),
      ),
    );
  return {
    income:
      allUserIncomeExpenceInMonth.reduce(
        (acc, cur) =>
          cur.taccounts?.type === "income"
            ? cur.entries.side === "cr"
              ? acc + cur.entries.amount
              : acc - cur.entries.amount
            : 0,
        0,
      ) / 100,
    expense:
      allUserIncomeExpenceInMonth.reduce(
        (acc, cur) =>
          cur.taccounts?.type === "expense"
            ? cur.entries.side === "dr"
              ? acc + cur.entries.amount
              : acc - cur.entries.amount
            : 0,
        0,
      ) / 100,
  };
}, "getIncomeExpense");
