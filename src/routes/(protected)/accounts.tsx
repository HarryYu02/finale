import { createAsync } from "@solidjs/router";
import { type Component, For } from "solid-js";
import AddTAccountForm from "@/components/AddTAccountForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAccounts } from "@/server";

const Accounts: Component = () => {
  const accounts = createAsync(() => getAccounts(), {
    initialValue: [],
  });

  return (
    <div class="">
      <div class="">
        <Dialog>
          <DialogTrigger as={Button}>+ Add account</DialogTrigger>
          <DialogContent class="max-w-[90%]">
            <DialogHeader>
              <DialogTitle>Add an account</DialogTitle>
            </DialogHeader>
            <AddTAccountForm />
          </DialogContent>
        </Dialog>
      </div>
      <For each={accounts()} fallback={"No accounts"}>
        {(account) => {
          return <p>{account.name}</p>;
        }}
      </For>
    </div>
  );
};

export default Accounts;
