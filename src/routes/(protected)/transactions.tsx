import { createAsync, useAction } from "@solidjs/router";
import Trash from "lucide-solid/icons/trash-2";
import { type Component, For, Show } from "solid-js";
import AddTransactionForm from "@/components/AddTransactionForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAccounts, getEntries } from "@/server";
import { deleteTransactionAction } from "@/server/actions";
import { Separator } from "@/components/ui/separator";

const Transactions: Component = () => {
  const deleteTransaction = useAction(deleteTransactionAction);
  const userEntries = createAsync(() => getEntries(), {
    initialValue: [],
  });
  const userAccounts = createAsync(() => getAccounts(), {
    initialValue: [],
  });

  const userTransactions = () => {
    const transactionsMap: Map<
      number,
      ReturnType<typeof userEntries>
    > = new Map();
    userEntries().forEach((entry) => {
      if (!entry.transactions) return;
      const prev = transactionsMap.get(entry.transactions.id) ?? [];
      transactionsMap.set(entry.transactions.id, [...prev, entry]);
    });
    return Array.from(
      transactionsMap,
      ([, v]) =>
        v[0].transactions && {
          meta: v[0].transactions,
          entries: v.map((entry) => ({
            ...entry.entries,
            account: entry.taccounts,
          })),
        },
    ).filter((t) => t !== null);
  };

  const userTransactionsByDate = () => {
    const transactionsMap: Map<
      string,
      ReturnType<typeof userTransactions>
    > = new Map();
    userTransactions().forEach((t) => {
      const prev = transactionsMap.get(t.meta.date.toLocaleDateString()) ?? [];
      transactionsMap.set(t.meta.date.toLocaleDateString(), [...prev, t]);
    });
    return Array.from(transactionsMap).toSorted((a, b) =>
      new Date(a[0]) > new Date(b[0]) ? -1 : 1,
    );
  };

  const uniqueUserTransactionDescriptions = () => {
    const descriptions: Set<string> = new Set();
    userTransactions().forEach((t) => {
      if (t.meta.description) descriptions.add(t.meta.description);
    });
    return [...descriptions];
  };

  return (
    <div class="">
      <Dialog>
        <DialogTrigger as={Button}>+ Add transaction</DialogTrigger>
        <DialogContent class="max-h-[90%] max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Add a transaction</DialogTitle>
          </DialogHeader>
          <AddTransactionForm
            accounts={userAccounts()}
            transactionsDesc={uniqueUserTransactionDescriptions()}
          />
        </DialogContent>
      </Dialog>
      <div class="flex flex-col gap-4 py-4">
        <For each={userTransactionsByDate()}>
          {(transaction) => {
            return (
              <div class="flex flex-col">
                <p class="font-bold">{transaction[0]}</p>
                <For each={transaction[1]} fallback={"No transactions"}>
                  {(transactionInDate, i) => {
                    return (
                      <div>
                        <Show when={i() > 0}>
                          <Separator class="my-2" />
                        </Show>
                        <div class="flex items-center justify-between">
                          <ul class="list-disc">
                            <p>
                              {transactionInDate.meta.description ?? "N/A"}{" "}
                            </p>
                            <For each={transactionInDate.entries}>
                              {(entry) => (
                                <li class="ml-6">
                                  {entry.account?.name}{" "}
                                  {entry.account?.normalSide === entry.side
                                    ? "+"
                                    : "-"}
                                  {entry.amount / 100}
                                </li>
                              )}
                            </For>
                          </ul>
                          <Button
                            variant={"destructive"}
                            onClick={async () => {
                              const deleted = await deleteTransaction(
                                transactionInDate.meta.id,
                              );
                              console.info(deleted);
                            }}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default Transactions;
