import { useAction } from "@solidjs/router";
import { createForm } from "@tanstack/solid-form";
import { createInsertSchema } from "drizzle-zod";
import type { Component } from "solid-js";
import * as z from "zod";
import { investments } from "@/db/schema";
import { addInvestment } from "@/server/actions";
import { Button } from "./ui/button";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "./ui/number-field";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from "./ui/text-field";
import { showToast } from "./ui/toast";

const investmentInsertSchema = createInsertSchema(investments)
  .extend({
    ticker: z.string().min(2, "What did you trade?"),
    price: z.number().gte(0.0001, "What's the price?"),
    share: z.number().gte(0.0001, "How much did you trade?"),
  })
  .pick({
    date: true,
    ticker: true,
    currency: true,
    price: true,
    share: true,
  });
type InsertFormSchemaType = z.infer<typeof investmentInsertSchema>;

const defaultInvestment: InsertFormSchemaType = {
  date: new Date(),
  ticker: "VFV:TSE",
  currency: "CAD",
  price: 0,
  share: 0,
};

const AddInvestmentForm: Component = () => {
  const addAccount = useAction(addInvestment);

  const form = createForm(() => ({
    defaultValues: defaultInvestment,
    onSubmit: async ({ value }) => {
      const inserted = await addAccount(value);
      if (inserted) {
        showToast({ title: "Investment added", variant: "success" });
        form.reset();
      } else {
        showToast({ title: "Investment not added", variant: "error" });
      }
    },
    validators: {
      onChange: investmentInsertSchema,
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
      <form.Field name="date">
        {(field) => (
          <TextField
            class=""
            validationState={
              field().state.meta.errors &&
              field().state.meta.errors.length === 0
                ? "valid"
                : "invalid"
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
      <form.Field name="ticker">
        {(field) => (
          <TextField
            class=""
            validationState={
              field().state.meta.errors &&
              field().state.meta.errors.length === 0
                ? "valid"
                : "invalid"
            }
            name={field().name}
            value={field().state.value}
            onBlur={field().handleBlur}
            onChange={(value) => field().handleChange(value)}
            required
          >
            <TextFieldLabel class="">Ticker:Exchange</TextFieldLabel>
            <TextFieldInput type="text" />
            <TextFieldErrorMessage>
              {field().state.meta.errors[0]?.message}
            </TextFieldErrorMessage>
          </TextField>
        )}
      </form.Field>
      <form.Field name="price">
        {(field) => (
          <NumberField
            class=""
            validationState={
              field().state.meta.errors &&
              field().state.meta.errors.length === 0
                ? "valid"
                : "invalid"
            }
            name={field().name}
            rawValue={field().state.value}
            onBlur={field().handleBlur}
            onRawValueChange={field().handleChange}
            required
            minValue={0}
            step={0.01}
            inputMode="decimal"
            format
            formatOptions={{
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            }}
          >
            <NumberFieldLabel>Price</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput
                onFocus={(e) => {
                  (e.target as HTMLInputElement).select();
                }}
              />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
            <NumberFieldErrorMessage>
              {field().state.meta.errors?.[0]?.message}
            </NumberFieldErrorMessage>
          </NumberField>
        )}
      </form.Field>
      <form.Field name="share">
        {(field) => (
          <NumberField
            class=""
            validationState={
              field().state.meta.errors &&
              field().state.meta.errors.length === 0
                ? "valid"
                : "invalid"
            }
            name={field().name}
            rawValue={field().state.value}
            onBlur={field().handleBlur}
            onRawValueChange={field().handleChange}
            required
            minValue={0}
            step={0.0001}
            inputMode="decimal"
            format
            formatOptions={{
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            }}
          >
            <NumberFieldLabel>Share</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput
                onFocus={(e) => {
                  (e.target as HTMLInputElement).select();
                }}
              />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
            <NumberFieldErrorMessage>
              {field().state.meta.errors?.[0]?.message}
            </NumberFieldErrorMessage>
          </NumberField>
        )}
      </form.Field>
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

export default AddInvestmentForm;
