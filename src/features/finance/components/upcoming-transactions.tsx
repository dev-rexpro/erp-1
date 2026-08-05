"use client";

import { ArrowDownLeft, ArrowUpRight, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const upcomingMaturities = [
  {
    id: 1,
    party: "PT Samudera Indonesia Tbk",
    type: "AP Vendor Bill",
    docNo: "BILL-2026-089",
    amount: "$48,200.00",
    dueDate: "Aug 05, 2026 (In 3 days)",
    category: "Ocean Freight",
    isPayable: true,
  },
  {
    id: 2,
    party: "PT Textile Nusantara Export",
    type: "AR Invoice Collection",
    docNo: "INV-2026-042",
    amount: "$38,500.00",
    dueDate: "Aug 08, 2026 (In 6 days)",
    category: "Client Collection",
    isPayable: false,
  },
  {
    id: 3,
    party: "Maersk Line Indonesia",
    type: "AP Vendor Bill",
    docNo: "BILL-2026-094",
    amount: "$62,100.00",
    dueDate: "Aug 12, 2026 (In 10 days)",
    category: "Freight Tariff",
    isPayable: true,
  },
  {
    id: 4,
    party: "PT Furniture Indo Utama",
    type: "AR Invoice Collection",
    docNo: "INV-2026-045",
    amount: "$29,400.00",
    dueDate: "Aug 15, 2026 (In 13 days)",
    category: "Client Collection",
    isPayable: false,
  },
];

export function UpcomingTransactions() {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-2">
        <CardTitle className="font-semibold text-sm flex items-center justify-between">
          <span>Upcoming Payables & Collections</span>
          <Badge variant="outline" className="text-[11px] font-normal">Next 14 Days</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
              AP Vendor Bills Due
            </span>
            <span className="font-bold text-base text-foreground">$110,300.00</span>
            <span className="text-[10px] text-muted-foreground block">2 carrier invoices pending</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
              AR Collections Expected
            </span>
            <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">$67,900.00</span>
            <span className="text-[10px] text-muted-foreground block">2 client invoices maturing</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {upcomingMaturities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-md border border-border/60 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.isPayable
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {item.isPayable ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownLeft className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-foreground truncate">{item.party}</span>
                    <span className="text-[10px] text-muted-foreground">({item.docNo})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <Calendar className="size-3" />
                    <span>{item.dueDate}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`font-bold text-xs ${item.isPayable ? "text-foreground" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {item.isPayable ? `- ${item.amount}` : `+ ${item.amount}`}
                </span>
                <span className="text-[10px] text-muted-foreground block">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

