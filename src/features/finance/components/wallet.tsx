import { Building2, Landmark, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const bankAccounts = [
  {
    id: 1,
    bankName: "BCA USD Freight Operating",
    accountNo: "088-2910-01",
    swiftCode: "CENAIDJA",
    balance: "$184,500.00",
    currency: "USD",
  },
  {
    id: 2,
    bankName: "Mandiri IDR Main Corporate",
    accountNo: "120-00-11882",
    swiftCode: "BMRIIDJA",
    balance: "Rp 2,336,025,000",
    equivalentUsd: "$142,000.00",
    currency: "IDR",
  },
  {
    id: 3,
    bankName: "CIMB Niaga Trade Escrow",
    accountNo: "800-1299-88",
    swiftCode: "BNIAIDJA",
    balance: "$64,200.00",
    currency: "USD",
  },
];

const reserves = [
  {
    id: 1,
    name: "Customs Duty & PPN Tax Deposit",
    facility: "Port Guarantee Escrow",
    amount: "$42,500.00",
    status: "Active Escrow",
  },
  {
    id: 2,
    name: "Demurrage Security Deposit",
    facility: "Pelindo / Shipping Line Collateral",
    amount: "$15,000.00",
    status: "Active Deposit",
  },
];

export function Wallet() {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-sm flex items-center justify-between">
          <span>Operating Bank Accounts</span>
          <span className="text-xs font-normal text-muted-foreground">3 Accounts Connected</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {bankAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-xs leading-none truncate">
                    {account.bankName}
                  </span>
                </div>
                <span className="font-normal text-muted-foreground text-[11px]">
                  Acc: {account.accountNo} • SWIFT: {account.swiftCode}
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-xs text-foreground">{account.balance}</div>
                {account.equivalentUsd && (
                  <div className="text-[10px] text-muted-foreground">({account.equivalentUsd})</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Port & Customs Security Guarantees
          </span>
          {reserves.map((res) => (
            <div key={res.id} className="flex items-center justify-between pt-1">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-foreground text-xs leading-none truncate">
                  {res.name}
                </span>
                <span className="font-normal text-muted-foreground text-[11px] truncate">
                  {res.facility}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-xs text-foreground">{res.amount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Landmark className="size-3.5 text-slate-500" />
            <span className="font-medium text-[11px] text-muted-foreground">
              Bank Reconciliation Status: <span className="text-foreground font-semibold">100% Reconciled</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span className="font-semibold text-[10px] text-emerald-600 uppercase tracking-wider">Verified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

