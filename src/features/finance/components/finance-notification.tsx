import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceNotification() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-card-foreground shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-xs text-foreground">
            3 Ocean Freight Vendor Bills Pending Manager Approval ($128,500.00)
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            Maersk Line & Samudera Indonesia tariff bills need review before August 5th payment cycle.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 text-xs h-8 border-amber-500/30 hover:bg-amber-500/10"
        onClick={() => navigate({ to: "/finance/vendor-bills" as any })}
      >
        Review Bills
      </Button>
    </div>
  );
}

