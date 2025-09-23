import { createAsync } from "@solidjs/router";
import { type Component, createSignal, For, Show } from "solid-js";
import AddTAccountForm from "@/components/AddTAccountForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { accountTypes } from "@/db/enum";
import { capitalize } from "@/lib/utils";
import { getAccounts } from "@/server";

const Accounts: Component = () => {
  const accounts = createAsync(() => getAccounts(), {
    initialValue: [],
  });
  const [expanded, setExpanded] = createSignal<(typeof accountTypes)[number][]>(
    [],
  );

  return (
    <div class="mx-auto flex w-full max-w-lg flex-col">
      <Accordion
        multiple={false}
        collapsible
        value={[...expanded()]}
        onChange={setExpanded}
      >
        <For each={accountTypes}>
          {(acType) => {
            const accountsInType = () =>
              accounts().filter((ac) => ac.type === acType);
            const amountInType = () =>
              accountsInType().reduce((sum, ac) => sum + ac.amount, 0);
            return (
              <AccordionItem value={acType}>
                <AccordionTrigger class="gap-2">
                  <div class="flex w-full items-center justify-between">
                    <span>{capitalize(acType)}</span>
                    <Show when={expanded()[0] !== acType}>
                      <span>${(amountInType() / 100).toFixed(2)}</span>
                    </Show>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <For
                    each={accountsInType()}
                    fallback={
                      <div class="w-full text-center text-muted-foreground">
                        No accounts
                      </div>
                    }
                  >
                    {(acInType) => (
                      <div class="flex w-full items-center justify-between">
                        <span>{acInType.name}</span>
                        <span>${(acInType.amount / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </For>
                </AccordionContent>
              </AccordionItem>
            );
          }}
        </For>
      </Accordion>
      <Dialog>
        <DialogTrigger as={Button} class="mx-auto mt-4 max-w-sm">
          + Add account
        </DialogTrigger>
        <DialogContent class="max-h-[90%] w-md max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Add an account</DialogTitle>
          </DialogHeader>
          <AddTAccountForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
