import { useAction } from "@solidjs/router";
import { createForm } from "@tanstack/solid-form";
import { createInsertSchema } from "drizzle-zod";
import Trash from "lucide-solid/icons/trash-2";
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
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from "./ui/number-field";
import { Separator } from "./ui/separator";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from "./ui/text-field";
import { showToast } from "./ui/toast";

const transactionInsertSchema = createInsertSchema(transactions);
const entryInsertSchema = createInsertSchema(entries);
const formEntrySchema = entryInsertSchema
  .pick({
    taccountId: true,
    amount: true,
  })
  .extend({
    amount: z.number().gte(0.01, { error: "How much?" }),
  });
const formSchema = transactionInsertSchema
  .pick({
    date: true,
    description: true,
  })
  .extend({
    from: z.array(formEntrySchema).min(1, { error: "From where?" }),
    to: z.array(formEntrySchema).min(1, { error: "To where?" }),
  })
  .refine(
    (v) => {
      const sumFrom = v.from.reduce((sum, cur) => sum + cur.amount, 0);
      const sumTo = v.to.reduce((sum, cur) => sum + cur.amount, 0);
      return sumFrom === sumTo;
    },
    { error: "Numbers don't add up." },
  );
type FormSchemaType = z.infer<typeof formSchema>;

const defaultValues: FormSchemaType = {
  date: new Date(),
  description: null,
  from: [],
  to: [],
};

type TAccount = typeof taccounts.$inferSelect;

const EditTransactionForm: Component<{
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
      const insertedTransactions = await addTransaction({
        date: value.date,
        description: value.description,
      });
      if (insertedTransactions.length === 0) return;
      const transactionId = insertedTransactions[0].id;
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
      showToast({ title: "Transaction added", variant: "success" });
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
        <form.Subscribe selector={(state) => state.errorMap}>
          {(errorMap) => {
            return (
              <p class="text-error-foreground text-sm">
                {errorMap().onChange?.[""]?.[0].message}
              </p>
            );
          }}
        </form.Subscribe>
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
              <TextFieldErrorMessage>When?</TextFieldErrorMessage>
            </TextField>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => {
            const options = () => [
              ...new Set(
                field().state.value
                  ? [...props.transactionsDesc, field().state.value]
                  : props.transactionsDesc,
              ),
            ];
            return (
              <Combobox
                class=""
                placeholder="Search for a description (optional)"
                options={options()}
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
                value={field().state.value}
                onBlur={field().handleBlur}
                onChange={(v) =>
                  field().handleChange(
                    !v?.length && (field().state.value?.length ?? 0) > 0
                      ? field().state.value
                      : v,
                  )
                }
                onInputChange={(v) => {
                  field().handleChange(v);
                }}
              >
                <ComboboxControl aria-label="Transaction description">
                  <ComboboxInput />
                  <ComboboxTrigger />
                </ComboboxControl>
                <ComboboxContent />
              </Combobox>
            );
          }}
        </form.Field>
        <p>To (Dr)</p>
        <form.Field name="to">
          {(field) => (
            <div class="flex flex-col gap-4">
              <Show
                when={
                  field().state.meta.errors &&
                  field().state.meta.errors.length > 0
                }
              >
                <p class="text-error-foreground text-xs">
                  {field().state.meta.errors?.[0]?.message}
                </p>
              </Show>
              <Show when={field().state.value.length > 0}>
                <Index each={field().state.value}>
                  {(_, i) => (
                    <div class="flex items-center gap-2">
                      <form.Field name={`to[${i}].taccountId`}>
                        {(subField) => (
                          // FIXME: arbitrary account name -> last selected option
                          <Combobox
                            placeholder="Select account"
                            class=""
                            options={props.accounts.map((ac) => ac.id)}
                            optionTextValue={(op) => accountIdToName(op) ?? ""}
                            name={subField().name}
                            value={subField().state.value}
                            onBlur={subField().handleBlur}
                            onChange={(value) => {
                              if (value) return subField().handleChange(value);
                            }}
                            required
                            validationState={
                              subField().state.meta.errors &&
                              subField().state.meta.errors.length === 0
                                ? "valid"
                                : "invalid"
                            }
                            itemComponent={(props) => (
                              <ComboboxItem item={props.item}>
                                <ComboboxItemLabel>
                                  {accountIdToName(props.item.rawValue)}
                                </ComboboxItemLabel>
                                <ComboboxItemIndicator />
                              </ComboboxItem>
                            )}
                          >
                            <ComboboxControl aria-label="To account">
                              <ComboboxInput
                                value={accountIdToName(subField().state.value)}
                                onFocus={(e) => {
                                  (e.target as HTMLInputElement).select();
                                }}
                              />
                              <ComboboxTrigger />
                            </ComboboxControl>
                            <ComboboxContent />
                          </Combobox>
                        )}
                      </form.Field>
                      <span>$</span>
                      <form.Field name={`to[${i}].amount`}>
                        {(subField) => (
                          <NumberField
                            class="flex flex-col gap-2"
                            validationState={
                              subField().state.meta.errors &&
                              subField().state.meta.errors.length === 0
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
                              <NumberFieldInput
                                onFocus={(e) => {
                                  (e.target as HTMLInputElement).select();
                                }}
                              />
                              <NumberFieldIncrementTrigger />
                              <NumberFieldDecrementTrigger />
                            </NumberFieldGroup>
                          </NumberField>
                        )}
                      </form.Field>
                      <Button
                        variant={"outline"}
                        class=""
                        onClick={() => {
                          field().removeValue(i);
                        }}
                      >
                        <Trash />
                      </Button>
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
        <p>From (Cr)</p>
        <form.Field name="from">
          {(field) => (
            <div class="flex flex-col gap-4">
              <Show
                when={
                  field().state.meta.errors &&
                  field().state.meta.errors.length > 0
                }
              >
                <p class="text-error-foreground text-xs">
                  {field().state.meta.errors?.[0]?.message}
                </p>
              </Show>
              <Show when={field().state.value.length > 0}>
                <Index each={field().state.value}>
                  {(_, i) => (
                    <div class="flex items-center gap-2">
                      <form.Field name={`from[${i}].taccountId`}>
                        {(subField) => (
                          <Combobox
                            placeholder="Select account"
                            class=""
                            options={props.accounts.map((ac) => ac.id)}
                            optionTextValue={(op) => accountIdToName(op) ?? ""}
                            name={subField().name}
                            value={subField().state.value}
                            onBlur={subField().handleBlur}
                            onChange={(value) => {
                              if (value) return subField().handleChange(value);
                            }}
                            required
                            validationState={
                              subField().state.meta.errors &&
                              subField().state.meta.errors.length === 0
                                ? "valid"
                                : "invalid"
                            }
                            itemComponent={(props) => (
                              <ComboboxItem item={props.item}>
                                <ComboboxItemLabel>
                                  {accountIdToName(props.item.rawValue)}
                                </ComboboxItemLabel>
                                <ComboboxItemIndicator />
                              </ComboboxItem>
                            )}
                          >
                            <ComboboxControl aria-label="To account">
                              <ComboboxInput
                                value={accountIdToName(subField().state.value)}
                                onFocus={(e) => {
                                  (e.target as HTMLInputElement).select();
                                }}
                              />
                              <ComboboxTrigger />
                            </ComboboxControl>
                            <ComboboxContent />
                          </Combobox>
                        )}
                      </form.Field>
                      <span>$</span>
                      <form.Field name={`from[${i}].amount`}>
                        {(subField) => (
                          <NumberField
                            class="flex flex-col gap-2"
                            validationState={
                              subField().state.meta.errors &&
                              subField().state.meta.errors.length === 0
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
                              <NumberFieldInput
                                onFocus={(e) => {
                                  (e.target as HTMLInputElement).select();
                                }}
                              />
                              <NumberFieldIncrementTrigger />
                              <NumberFieldDecrementTrigger />
                            </NumberFieldGroup>
                          </NumberField>
                        )}
                      </form.Field>
                      <Button
                        variant={"outline"}
                        class=""
                        onClick={() => {
                          field().removeValue(i);
                        }}
                      >
                        <Trash />
                      </Button>
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

export default EditTransactionForm;
