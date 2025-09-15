import { createAsync } from "@solidjs/router";
import { type Component, createMemo } from "solid-js";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIncomeExpense, getNetWorth } from "@/server";

const Dashboard: Component = () => {
  const netWorth = createAsync(() => getNetWorth());
  const incomeExpense = createAsync(() => getIncomeExpense());

  const cashFlow = createMemo(() => {
    if (!incomeExpense()) return;
    return (incomeExpense()?.income ?? 0) - (incomeExpense()?.expense ?? 0);
  });
  const savingsRate = createMemo(() => {
    if (!incomeExpense()) return;
    if (incomeExpense()?.income === 0 || (cashFlow() ?? 0) < 0) return 0;
    return (cashFlow() ?? 0) / (incomeExpense()?.income ?? 1);
  });

  function formatDollar(amount?: number) {
    if (amount === undefined) return;
    return `${amount < 0 ? "-" : ""}$${Math.abs(amount).toFixed(2)}`;
  }
  function formatPercentage(percentage?: number) {
    if (percentage === undefined) return;
    return `${percentage < 0 ? "-" : ""}${Math.abs(percentage * 100).toFixed(2)}%`;
  }

  return (
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div class="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4">
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Net Worth</CardDescription>
            <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {formatDollar(netWorth())}
            </CardTitle>
          </CardHeader>
          <CardFooter class="flex-col items-start gap-1.5 text-sm">
            <div class="text-muted-foreground">Asset - Liabilities</div>
          </CardFooter>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Cash Flow</CardDescription>
            <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {formatDollar(cashFlow())}
            </CardTitle>
          </CardHeader>
          <CardFooter class="flex-col items-start gap-1.5 text-sm">
            <div class="text-muted-foreground">Income - Expense</div>
          </CardFooter>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Expense</CardDescription>
            <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {formatDollar(incomeExpense()?.expense)}
            </CardTitle>
          </CardHeader>
          <CardFooter class="flex-col items-start gap-1.5 text-sm">
            <div class="text-muted-foreground">Expense per account</div>
          </CardFooter>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Savings Rate</CardDescription>
            <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {formatPercentage(savingsRate())}
            </CardTitle>
          </CardHeader>
          <CardFooter class="flex-col items-start gap-1.5 text-sm">
            <div class="text-muted-foreground">Cash Flow / Income</div>
          </CardFooter>
        </Card>
      </div>
      <div class="px-4 lg:px-6"></div>
    </div>
  );
};

export default Dashboard;
