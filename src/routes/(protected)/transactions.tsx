import { createAsync, useAction } from "@solidjs/router";
import More from "lucide-solid/icons/ellipsis-vertical";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
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

  const uniqueUserTransactionDescriptions = () => {
    const descriptions: Set<string> = new Set();
    userTransactions().forEach((t) => {
      if (t.meta.description) descriptions.add(t.meta.description);
    });
    return [...descriptions];
  };

  return (
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <Dialog>
        <DialogTrigger as={Button} class="mx-auto max-w-md">
          + Add transaction
        </DialogTrigger>
        <DialogContent class="max-h-[90%] w-md max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Add a transaction</DialogTitle>
          </DialogHeader>
          <AddTransactionForm
            accounts={userAccounts()}
            transactionsDesc={uniqueUserTransactionDescriptions()}
          />
        </DialogContent>
      </Dialog>
      <div class="mx-auto grid w-full max-w-lg grid-cols-6 gap-4">
        <For each={userTransactionsByDate()}>
          {(transactions) => {
            return (
              <div class="col-span-full grid grid-cols-subgrid">
                <p class="col-span-full text-muted-foreground text-sm uppercase">
                  {new Date(`${transactions[0]}T00:00:00`).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
                <For each={transactions[1]} fallback={"No transactions"}>
                  {(transactionInDate, i) => {
                    return (
                      <>
                        <Show when={i() > 0}>
                          <Separator class="col-span-full my-2" />
                        </Show>
                        <div class="col-span-5 grid grid-cols-subgrid">
                          <p class="col-span-full font-semibold">
                            {transactionInDate.meta.description ?? "N/A"}
                          </p>
                          <For each={transactionInDate.entries}>
                            {(entry) => (
                              <>
                                <span
                                  class={cn(
                                    "col-span-3 pl-6",
                                    entry.side === "cr" && "pl-12",
                                  )}
                                >
                                  {entry.account?.name}
                                </span>
                                <span class="justify-self-end tabular-nums">
                                  <Show when={entry.side === "dr"}>
                                    {(entry.amount / 100).toFixed(2)}
                                  </Show>
                                </span>
                                <span class="justify-self-end tabular-nums">
                                  <Show when={entry.side === "cr"}>
                                    {(entry.amount / 100).toFixed(2)}
                                  </Show>
                                </span>
                              </>
                            )}
                          </For>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            as={Button}
                            variant={"ghost"}
                            size={"icon"}
                            class="place-self-center"
                          >
                            <More />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={async () => {}}>
                              <Trash size={16} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const deleted = await deleteTransaction(
                                  transactionInDate.meta.id,
                                );
                                showToast({
                                  title: "Deleted",
                                  variant: "success",
                                  description: `${deleted[0].description ?? "Transaction"} deleted successfully.`,
                                });
                              }}
                            >
                              <Trash size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
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
