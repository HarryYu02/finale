import { createAsync } from "@solidjs/router";
import { type Component, For } from "solid-js";
import AddInvestmentForm from "@/components/AddInvestmentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getInvestments, getStockPrice } from "@/server";

const InvestmentOverview: Component<{
  ticker: string;
  totalShares: number;
  totalCost: number;
}> = (props) => {
  const stockInfo = createAsync(() => getStockPrice(props.ticker), {
    deferStream: true,
  });
  const stockPrice = () => (stockInfo()?.price ?? 0) / 100;
  return (
    <div class="flex gap-4">
      <span>{props.ticker}</span>
      <span>{props.totalShares.toFixed(2)}</span>
      <span>{props.totalCost.toFixed(2)}</span>
      <span>{(props.totalCost / props.totalShares).toFixed(2)}</span>
      <span>{(stockPrice() * props.totalShares).toFixed(2)}</span>
      <span>{stockPrice().toFixed(2)}</span>
      <span>
        {(stockPrice() * props.totalShares - props.totalCost).toFixed(2)}
      </span>
      <span>
        {`${(
          ((stockPrice() * props.totalShares - props.totalCost) /
            props.totalCost) *
            100
        ).toFixed(2)}%`}
      </span>
    </div>
  );
};

const Investments: Component = () => {
  const investments = createAsync(() => getInvestments(), {
    initialValue: [],
  });

  const investmentsOverview = () => {
    const map: Map<string, { totalShares: number; totalCost: number }> =
      new Map();
    investments().forEach((inv) => {
      const prev = map.get(inv.ticker);
      map.set(inv.ticker, {
        totalShares: (prev?.totalShares ?? 0) + inv.share / 10000,
        totalCost:
          (prev?.totalCost ?? 0) + ((inv.share / 10000) * inv.price) / 10000,
      });
    });
    return Array.from(map);
  };

  return (
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <Dialog>
        <DialogTrigger as={Button} class="mx-auto max-w-md">
          + Add investment
        </DialogTrigger>
        <DialogContent class="max-h-[90%] w-md max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Add a investment</DialogTitle>
          </DialogHeader>
          <AddInvestmentForm />
        </DialogContent>
      </Dialog>
      <For each={investmentsOverview()}>
        {(item) => (
          <InvestmentOverview
            ticker={item[0]}
            totalShares={item[1].totalShares}
            totalCost={item[1].totalCost}
          />
        )}
      </For>
      <For each={investments()}>
        {(investment) => {
          const cost = () =>
            (investment.price / 10000) * (investment.share / 10000);
          return (
            <div class="flex gap-4">
              <span>{investment.date.toLocaleDateString()}</span>
              <span>{investment.ticker}</span>
              <span>{(investment.price / 10000).toFixed(4)}</span>
              <span>{(investment.share / 10000).toFixed(4)}</span>
              <span>{cost().toFixed(2)}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default Investments;
