import { createAsync, useAction } from "@solidjs/router";
import { type Component, For } from "solid-js";
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

  const uniqueUserTransactionDescriptions = () => [
    ...new Set(userTransactions().map((t) => t.meta.description ?? "")),
  ];

  return (
    <div class="">
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
      </div>
      <For each={userTransactionsByDate()}>
        {(transaction) => {
          return (
            <div>
              <p class="font-bold">{transaction[0]}</p>
              <For each={transaction[1]} fallback={"No transactions"}>
                {(transactionInDate) => {
                  return (
                    <div>
                      <p>
                        {transactionInDate.meta.description ?? "N/A"}{" "}
                        <Button
                          variant={"destructive"}
                          onClick={async () => {
                            const deleted = await deleteTransaction(
                              transactionInDate.meta.id,
                            );
                            console.info(deleted);
                          }}
                        >
                          -
                        </Button>
                      </p>
                      <ul class="list-disc pl-8">
                        <For each={transactionInDate.entries}>
                          {(entry) => (
                            <li>
                              {entry.account?.name}{" "}
                              {entry.account?.normalSide === entry.side
                                ? "+"
                                : "-"}
                              {entry.amount / 100}
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  );
                }}
              </For>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default Transactions;
