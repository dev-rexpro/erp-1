import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const streams = [
  {
    title: "Ocean Freight (FCL/LCL)",
    share: "65%",
    amount: "$811,525.00",
    color: "bg-slate-800 dark:bg-slate-200",
    percentage: 65,
  },
  {
    title: "Customs & Duty Clearance",
    share: "18%",
    amount: "$224,730.00",
    color: "bg-slate-600 dark:bg-slate-400",
    percentage: 18,
  },
  {
    title: "Port & Terminal Handling",
    share: "10%",
    amount: "$124,850.00",
    color: "bg-slate-500 dark:bg-slate-500",
    percentage: 10,
  },
  {
    title: "Inland Trucking & Feeder",
    share: "7%",
    amount: "$87,395.00",
    color: "bg-slate-400 dark:bg-slate-600",
    percentage: 7,
  },
]

export function IncomeBreakdown() {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-sm">Freight Revenue Streams</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {streams.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30 gap-2 min-w-0"
          >
            <div className="flex items-center justify-between gap-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium truncate" title={item.title}>
                {item.title}
              </span>
              <span className="text-[11px] font-semibold text-foreground shrink-0 bg-background px-1.5 py-0.5 rounded border border-border/80">
                {item.share}
              </span>
            </div>
            <div className="text-base font-bold tracking-tight text-foreground">{item.amount}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


