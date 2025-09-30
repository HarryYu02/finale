import { query, redirect } from "@solidjs/router";
import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { getRequestEvent } from "solid-js/web";
import { db } from "@/db";
import {
  entries,
  investments,
  stockPrices,
  taccounts,
  transactions,
} from "@/db/schema";
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
    .orderBy(desc(entries.side), desc(transactions.createdAt));
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
        not(taccounts.isInvestment),
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
            : acc,
        0,
      ) / 100,
    expense:
      allUserIncomeExpenceInMonth.reduce(
        (acc, cur) =>
          cur.taccounts?.type === "expense"
            ? cur.entries.side === "dr"
              ? acc + cur.entries.amount
              : acc - cur.entries.amount
            : acc,
        0,
      ) / 100,
  };
}, "getIncomeExpense");

export const getInvestments = query(async () => {
  "use server";
  const session = await assertSession();
  const data = await db
    .select()
    .from(investments)
    .where(eq(investments.userId, session.user.id))
    .orderBy(desc(investments.date));
  return data;
}, "getInvestments");

export const getStockPrice = query(async (ticker: string) => {
  "use server";
  await assertSession();
  const data = await db
    .select()
    .from(stockPrices)
    .where(eq(stockPrices.ticker, ticker))
    .orderBy(desc(stockPrices.createdAt))
    .limit(1);
  return data[0];
}, "getStockPrice");
