"use client";

import React, { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthlyData = [
  { month: "Jan 2026", revenue: 168000, cogs: 112000, margin: 56000 },
  { month: "Feb 2026", revenue: 175000, cogs: 118000, margin: 57000 },
  { month: "Mar 2026", revenue: 194000, cogs: 129000, margin: 65000 },
  { month: "Apr 2026", revenue: 188000, cogs: 125000, margin: 63000 },
  { month: "May 2026", revenue: 215000, cogs: 142000, margin: 73000 },
  { month: "Jun 2026", revenue: 232000, cogs: 154000, margin: 78000 },
  { month: "Jul 2026", revenue: 248500, cogs: 165000, margin: 83500 },
];

export function TransactionsOverviewCard() {
  const [period, setPeriod] = useState("monthly");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-semibold text-sm">Revenue vs Logistics Operating Expense (COGS)</CardTitle>
          <p className="text-muted-foreground text-xs">Monthly Freight Margin Performance Analysis</p>
        </div>
        <CardAction>
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="ytd">YTD Total</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex items-center gap-6 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
            <span className="text-muted-foreground font-medium">Freight Revenue ($)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="text-muted-foreground font-medium">Logistics COGS ($)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground font-medium">Gross Margin ($)</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(51, 65, 85, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="currentColor"
                strokeWidth={2.5}
                className="text-slate-900 dark:text-slate-100"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cogs"
                name="COGS"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="text-slate-400 dark:text-slate-500"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="margin"
                name="Gross Margin"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

