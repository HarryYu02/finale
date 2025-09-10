import { useAction } from "@solidjs/router";
import { createForm } from "@tanstack/solid-form";
import { createInsertSchema } from "drizzle-zod";
import type { Component } from "solid-js";
import * as z from "zod";
import { accountTypes } from "@/db/enum";
import { taccounts } from "@/db/schema";
import { capitalize } from "@/lib/utils";
import { addTAccountAction } from "@/server/actions";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectErrorMessage,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from "./ui/text-field";
import { showToast } from "./ui/toast";

const taccountInsertSchema = createInsertSchema(taccounts)
  .extend({
    name: z.string().min(2, "Account name has to be longer than 2 characters."),
  })
  .pick({
    name: true,
    type: true,
  });
type InsertFormSchemaType = z.infer<typeof taccountInsertSchema>;

const defaultTAccount: InsertFormSchemaType = {
  name: "",
  type: "asset",
};

const AddTAccountForm: Component = () => {
  const addAccount = useAction(addTAccountAction);

  const form = createForm(() => ({
    defaultValues: defaultTAccount,
    onSubmit: async ({ value }) => {
      console.log(value);
      const inserted = await addAccount(value);
      if (inserted) {
        showToast({ title: "Account added", variant: "success" });
        form.reset();
      } else {
        showToast({ title: "Account not added", variant: "error" });
      }
    },
    validators: {
      onChange: taccountInsertSchema,
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-2">
        <form.Field name="name">
          {(field) => (
            <TextField
              class=""
              validationState={
                field().state.meta.errors.length === 0 ? "valid" : "invalid"
              }
              name={field().name}
              value={field().state.value}
              onBlur={field().handleBlur}
              onChange={(value) => field().handleChange(value)}
              required
            >
              <TextFieldLabel class="">Account name</TextFieldLabel>
              <TextFieldInput type="text" />
              <TextFieldErrorMessage>
                {field().state.meta.errors[0]?.message}
              </TextFieldErrorMessage>
            </TextField>
          )}
        </form.Field>
        <form.Field name="type">
          {(field) => (
            <Select
              class=""
              validationState={
                field().state.meta.errors.length === 0 ? "valid" : "invalid"
              }
              name={field().name}
              value={field().state.value}
              onBlur={field().handleBlur}
              onChange={(value) => {
                if (value) return field().handleChange(value);
              }}
              required
              options={[...accountTypes]}
              placeholder="Select account type"
              itemComponent={(props) => (
                <SelectItem item={props.item}>
                  {capitalize(props.item.rawValue)}
                </SelectItem>
              )}
            >
              <SelectLabel>Account Type</SelectLabel>
              <SelectTrigger aria-label="Account type" class="w-[180px]">
                <SelectValue<string>>
                  {(state) => capitalize(state.selectedOption())}
                </SelectValue>
              </SelectTrigger>
              <SelectContent />
              <SelectErrorMessage>
                {field().state.meta.errors[0]?.message}
              </SelectErrorMessage>
            </Select>
          )}
        </form.Field>
      </div>
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {(state) => {
          return (
            <Button type="submit" disabled={!state().canSubmit}>
              {state().isSubmitting ? "..." : "Submit"}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
};

export default AddTAccountForm;
