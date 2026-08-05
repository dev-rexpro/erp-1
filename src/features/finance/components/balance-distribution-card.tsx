"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const balanceData = [
  { account: "BCA USD Freight Operating", amount: 184500, percentage: 32.2, color: "#1e293b" },
  { account: "Trade Accounts Receivable", amount: 188200, percentage: 32.8, color: "#334155" },
  { account: "Mandiri IDR Corporate Main", amount: 142000, percentage: 24.8, color: "#475569" },
  { account: "Port & Customs Escrow", amount: 57500, percentage: 10.2, color: "#64748b" },
];

export function BalanceDistributionCard() {
  const [currency, setCurrency] = React.useState("USD");
  const totalBalance = React.useMemo(() => balanceData.reduce((total, item) => total + item.amount, 0), []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-semibold text-sm">Working Capital & Asset Distribution</CardTitle>
          <p className="text-muted-foreground text-xs">Liquid Cash, Accounts Receivable & Security Deposits</p>
        </div>
        <CardAction>
          <Select onValueChange={setCurrency} value={currency}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="USD">USD Balance</SelectItem>
                <SelectItem value="IDR">IDR Balance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="grid items-center gap-4 pt-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <div className="mx-auto h-48 w-full max-w-[200px]">
          <PieChart width={200} height={192}>
            <Pie
              data={balanceData}
              dataKey="amount"
              nameKey="account"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {balanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) return null;
                  return (
                    <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                      <tspan className="fill-muted-foreground text-[10px] font-medium" x={viewBox.cx} y={(viewBox.cy ?? 0) - 8}>
                        Total Liquid
                      </tspan>
                      <tspan className="fill-foreground font-bold text-sm tracking-tight" x={viewBox.cx} y={(viewBox.cy ?? 0) + 12}>
                        {formatCurrency(totalBalance)}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          {balanceData.map((item) => (
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border/50 pb-1.5 last:border-0" key={item.account}>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <p className="truncate text-muted-foreground text-xs font-medium">{item.account}</p>
                </div>
                <p className="font-semibold text-xs text-foreground mt-0.5">
                  {formatCurrency(item.amount)}
                </p>
              </div>
              <div className="font-medium text-xs text-muted-foreground">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

