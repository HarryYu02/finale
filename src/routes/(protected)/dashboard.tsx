import { createAsync } from "@solidjs/router";
import TrendingDown from "lucide-solid/icons/trending-down";
import TrendingUp from "lucide-solid/icons/trending-up";
import { createMemo, type Component } from "solid-js";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIncomeExpense, getNetWorth } from "@/server";

const Dashboard: Component = () => {
  const currentMonth = () =>
    new Date().toLocaleString("en-US", { month: "short" });

  const netWorth = createAsync(() => getNetWorth());
  const incomeExpense = createAsync(() => getIncomeExpense());

  const cashFlow = createMemo(() => {
    if (!incomeExpense()) return;
    return (incomeExpense()?.income ?? 0) - (incomeExpense()?.expense ?? 0);
  });
  const savingsRate = createMemo(() => {
    if (!incomeExpense() || !cashFlow()) return;
    if (incomeExpense()?.income === 0 || (cashFlow() ?? 0) < 0) return 0;
    return (cashFlow() ?? 0) / (incomeExpense()?.income ?? 1);
  });

  function formatDollar(amount?: number) {
    if (amount === undefined) return;
    return `${amount < 0 ? "-" : ""}$${Math.abs(amount).toFixed(2)}`;
  }
  function formatPercentage(percentage?: number) {
    if (percentage === undefined) return;
    return `${percentage < 0 ? "-" : ""}${Math.abs(percentage).toFixed(2)}%`;
  }

  return (
    <div class="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4">
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>Net Worth</CardDescription>
          <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {formatDollar(netWorth())}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter class="flex-col items-start gap-1.5 text-sm">
          <div class="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp class="size-4" />
          </div>
          <div class="text-muted-foreground">Asset - Liabilities</div>
        </CardFooter>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>{currentMonth()}. Cash Flow</CardDescription>
          <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {formatDollar(cashFlow())}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter class="flex-col items-start gap-1.5 text-sm">
          <div class="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown class="size-4" />
          </div>
          <div class="text-muted-foreground">Income - Expense</div>
        </CardFooter>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>{currentMonth()}. Expense</CardDescription>
          <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {formatDollar(incomeExpense()?.expense)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter class="flex-col items-start gap-1.5 text-sm">
          <div class="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingUp class="size-4" />
          </div>
          <div class="text-muted-foreground">Expense per account</div>
        </CardFooter>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>{currentMonth()}. Savings Rate</CardDescription>
          <CardTitle class="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {formatPercentage(savingsRate())}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter class="flex-col items-start gap-1.5 text-sm">
          <div class="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <TrendingUp class="size-4" />
          </div>
          <div class="text-muted-foreground">Cash Flow / Income</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
