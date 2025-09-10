import { query, redirect } from "@solidjs/router";
import { eq } from "drizzle-orm";
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
    .where(eq(transactions.userId, session.user.id));
  return allEntries;
}, "getEntries");
