import { useAction } from "@solidjs/router";
import { createForm } from "@tanstack/solid-form";
import { createInsertSchema } from "drizzle-zod";
import { type Component, Index, Show } from "solid-js";
import * as z from "zod";
import { entries, type taccounts, transactions } from "@/db/schema";
import { addEntryAction, addTransactionAction } from "@/server/actions";
import { Button } from "./ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxTrigger,
} from "./ui/combobox";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from "./ui/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from "./ui/text-field";

const transactionInsertSchema = createInsertSchema(transactions);
const entryInsertSchema = createInsertSchema(entries);
const formEntrySchema = entryInsertSchema
  .pick({
    taccountId: true,
    amount: true,
  })
  .extend({
    amount: z.float32(),
  });
const formSchema = transactionInsertSchema
  .pick({
    date: true,
    description: true,
  })
  .extend({
    from: z.array(formEntrySchema),
    to: z.array(formEntrySchema),
  });
type FormSchemaType = z.infer<typeof formSchema>;

const defaultValues: FormSchemaType = {
  date: new Date(),
  description: null,
  from: [],
  to: [],
};

type TAccount = typeof taccounts.$inferSelect;

const AddTransactionForm: Component<{
  accounts: TAccount[];
  transactionsDesc: string[];
}> = (props) => {
  const addTransaction = useAction(addTransactionAction);
  const addEntry = useAction(addEntryAction);
  const accountsMap = () => {
    const map: Map<number, TAccount> = new Map();
    props.accounts.forEach((ac) => {
      map.set(ac.id, ac);
    });
    return map;
  };
  function accountIdToName(id: number) {
    return accountsMap().get(id)?.name;
  }

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      console.log(value);
      return;
      const insertedTransactions = await addTransaction({
        date: value.date,
        description: value.description,
      });
      if (insertedTransactions.length === 0) return;
      const transactionId = insertedTransactions[0].id;
      // FIXME: validate entries
      for (let i = 0; i < value.from.length; ++i) {
        const ac = accountsMap().get(value.from[i].taccountId);
        if (!ac) return;
        const amount = value.from[i].amount;
        await addEntry({
          amount: amount * 100,
          transactionId: transactionId,
          taccountId: ac.id,
          side: "cr",
        });
      }
      for (let i = 0; i < value.to.length; ++i) {
        const ac = accountsMap().get(value.to[i].taccountId);
        if (!ac) return;
        const amount = value.to[i].amount;
        await addEntry({
          amount: amount * 100,
          transactionId: transactionId,
          taccountId: ac.id,
          side: "dr",
        });
      }
      form.reset();
    },
    validators: {
      onChange: formSchema,
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
        <form.Field name="date">
          {(field) => (
            <TextField
              class=""
              validationState={
                field().state.meta.errors.length === 0 ? "valid" : "invalid"
              }
              name={field().name}
              value={field().state.value.toLocaleDateString()}
              onBlur={field().handleBlur}
              onChange={(value) => {
                const [year, month, day] = value.split("-").map(Number);
                return field().handleChange(new Date(year, month - 1, day));
              }}
            >
              <TextFieldLabel class="">Date</TextFieldLabel>
              <TextFieldInput type="date" />
              <TextFieldErrorMessage>
                {field().state.meta.errors[0]?.message}
              </TextFieldErrorMessage>
            </TextField>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <Combobox
              class=""
              placeholder="Search for a description"
              options={props.transactionsDesc}
              itemComponent={(props) => (
                <ComboboxItem item={props.item}>
                  <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                  <ComboboxItemIndicator />
                </ComboboxItem>
              )}
              validationState={
                field().state.meta.errors.length === 0 ? "valid" : "invalid"
              }
              name={field().name}
              value={field().state.value ?? ""}
              onBlur={field().handleBlur}
              onChange={(value) => {
                console.info(value ?? "NULL");
                return field().handleChange(value);
              }}
            >
              <ComboboxControl aria-label="Transaction description">
                <ComboboxInput />
                <ComboboxTrigger />
              </ComboboxControl>
              <ComboboxContent />
            </Combobox>
          )}
        </form.Field>
        <p>From</p>
        <form.Field name="from">
          {(field) => (
            <div class="flex flex-col gap-4">
              <Show when={field().state.value.length > 0}>
                <Index each={field().state.value}>
                  {(_, i) => (
                    <div class="flex items-center gap-2">
                      <form.Field name={`from[${i}].taccountId`}>
                        {(subField) => (
                          <Select
                            class=""
                            name={subField().name}
                            value={subField().state.value}
                            onBlur={subField().handleBlur}
                            onChange={(value) => {
                              if (value) return subField().handleChange(value);
                            }}
                            required
                            options={props.accounts.map((ac) => ac.id)}
                            placeholder="Select account type"
                            itemComponent={(selectProps) => (
                              <SelectItem item={selectProps.item}>
                                {accountIdToName(selectProps.item.rawValue)}
                              </SelectItem>
                            )}
                          >
                            <SelectTrigger
                              aria-label="Account"
                              class="w-[180px]"
                            >
                              <SelectValue<number>>
                                {(state) =>
                                  accountIdToName(state.selectedOption())
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent />
                          </Select>
                        )}
                      </form.Field>
                      <span>$</span>
                      <form.Field name={`from[${i}].amount`}>
                        {(subField) => (
                          <NumberField
                            class="flex flex-col gap-2"
                            validationState={
                              field().state.meta.errors.length === 0
                                ? "valid"
                                : "invalid"
                            }
                            name={subField().name}
                            rawValue={subField().state.value}
                            onBlur={subField().handleBlur}
                            onRawValueChange={subField().handleChange}
                            required
                            minValue={0}
                            step={0.01}
                            inputMode="decimal"
                            format
                            formatOptions={{
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }}
                          >
                            <NumberFieldGroup>
                              <NumberFieldInput />
                              <NumberFieldIncrementTrigger />
                              <NumberFieldDecrementTrigger />
                            </NumberFieldGroup>
                            <NumberFieldErrorMessage>
                              {subField().state.meta.errors[0]?.message}
                            </NumberFieldErrorMessage>
                          </NumberField>
                        )}
                      </form.Field>
                    </div>
                  )}
                </Index>
              </Show>
              <Button
                onClick={() =>
                  field().pushValue({
                    amount: 0,
                    taccountId: props.accounts[0].id,
                  })
                }
                disabled={props.accounts.length === 0}
                type="button"
                variant={"secondary"}
              >
                + Add
              </Button>
            </div>
          )}
        </form.Field>
        <p>To</p>
        <form.Field name="to">
          {(field) => (
            <div class="flex flex-col gap-4">
              <Show when={field().state.value.length > 0}>
                <Index each={field().state.value}>
                  {(_, i) => (
                    <div class="flex items-center gap-2">
                      <form.Field name={`to[${i}].taccountId`}>
                        {(subField) => (
                          <Select
                            class=""
                            name={subField().name}
                            value={subField().state.value}
                            onBlur={subField().handleBlur}
                            onChange={(value) => {
                              if (value) return subField().handleChange(value);
                            }}
                            required
                            options={props.accounts.map((ac) => ac.id)}
                            placeholder="Select account type"
                            itemComponent={(selectProps) => (
                              <SelectItem item={selectProps.item}>
                                {accountIdToName(selectProps.item.rawValue)}
                              </SelectItem>
                            )}
                          >
                            <SelectTrigger
                              aria-label="Account"
                              class="w-[180px]"
                            >
                              <SelectValue<number>>
                                {(state) =>
                                  accountIdToName(state.selectedOption())
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent />
                          </Select>
                        )}
                      </form.Field>
                      <span>$</span>
                      <form.Field name={`to[${i}].amount`}>
                        {(subField) => (
                          <NumberField
                            class="flex flex-col gap-2"
                            validationState={
                              field().state.meta.errors.length === 0
                                ? "valid"
                                : "invalid"
                            }
                            name={subField().name}
                            rawValue={subField().state.value}
                            onBlur={subField().handleBlur}
                            onRawValueChange={subField().handleChange}
                            required
                            minValue={0}
                            step={0.01}
                            inputMode="decimal"
                            format
                            formatOptions={{
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }}
                          >
                            <NumberFieldGroup>
                              <NumberFieldInput />
                              <NumberFieldIncrementTrigger />
                              <NumberFieldDecrementTrigger />
                            </NumberFieldGroup>
                            <NumberFieldErrorMessage>
                              {subField().state.meta.errors[0]?.message}
                            </NumberFieldErrorMessage>
                          </NumberField>
                        )}
                      </form.Field>
                    </div>
                  )}
                </Index>
              </Show>
              <Button
                onClick={() =>
                  field().pushValue({
                    amount: 0,
                    taccountId: props.accounts[0].id,
                  })
                }
                disabled={props.accounts.length === 0}
                type="button"
                variant={"secondary"}
              >
                + Add
              </Button>
            </div>
          )}
        </form.Field>
      </div>
      <Separator />
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

export default AddTransactionForm;
