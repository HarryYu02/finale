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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <TableRow class="">
      <TableCell>{props.ticker}</TableCell>
      <TableCell>{props.totalShares.toFixed(2)}</TableCell>
      <TableCell>{props.totalCost.toFixed(2)}</TableCell>
      <TableCell>{(props.totalCost / props.totalShares).toFixed(2)}</TableCell>
      <TableCell>{(stockPrice() * props.totalShares).toFixed(2)}</TableCell>
      <TableCell>{stockPrice().toFixed(2)}</TableCell>
      <TableCell>
        {(stockPrice() * props.totalShares - props.totalCost).toFixed(2)}
      </TableCell>
      <TableCell>
        {`${(
          ((stockPrice() * props.totalShares - props.totalCost) /
            props.totalCost) *
            100
        ).toFixed(2)}%`}
      </TableCell>
    </TableRow>
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
    <div class="mx-auto flex flex-col gap-6 py-6">
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
      <Table class="w-fit">
        <TableHeader>
          <TableRow>
            <TableHead class="">Ticker</TableHead>
            <TableHead class="">Total shares</TableHead>
            <TableHead class="">Book cost</TableHead>
            <TableHead class="">Average price</TableHead>
            <TableHead class="">Book value</TableHead>
            <TableHead class="">Current price</TableHead>
            <TableHead class="">Net change</TableHead>
            <TableHead class="">Net change %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <For each={investmentsOverview()}>
            {(item) => (
              <InvestmentOverview
                ticker={item[0]}
                totalShares={item[1].totalShares}
                totalCost={item[1].totalCost}
              />
            )}
          </For>
        </TableBody>
      </Table>
      <Table class="mx-auto max-w-lg">
        <TableHeader>
          <TableRow>
            <TableHead class="">Date</TableHead>
            <TableHead class="">Ticker</TableHead>
            <TableHead class="">Price</TableHead>
            <TableHead class="">Share</TableHead>
            <TableHead class="">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <For each={investments()}>
            {(investment) => {
              const cost = () =>
                (investment.price / 10000) * (investment.share / 10000);
              return (
                <TableRow class="">
                  <TableCell>{investment.date.toLocaleDateString()}</TableCell>
                  <TableCell>{investment.ticker}</TableCell>
                  <TableCell>
                    ${(investment.price / 10000).toFixed(4)}
                  </TableCell>
                  <TableCell>{(investment.share / 10000).toFixed(4)}</TableCell>
                  <TableCell>${cost().toFixed(2)}</TableCell>
                </TableRow>
              );
            }}
          </For>
        </TableBody>
      </Table>
    </div>
  );
};

export default Investments;
