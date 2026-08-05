import { useState, useRef, useEffect } from "react";
import {
  AlertTriangleIcon,
  Copy,
  Plane,
  Ship,
  Star,
  Truck,
  Maximize2,
  Minimize2,
  GripHorizontal,
  RotateCcw,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { Shipment } from "../data/shipment-data";
import { ShipmentRouteMap } from "./shipment-route-map";

const modeIcons = {
  air: Plane,
  land: Truck,
  sea: Ship,
} as const;

const progressRingClasses: Record<Shipment["status"], string> = {
  Scheduled: "text-muted-foreground",
  "In Transit": "text-primary",
  "Out for Delivery": "text-primary",
  Delivered: "text-green-600",
  Delayed: "text-destructive",
  "On Hold": "text-amber-500",
  "Customs Hold": "text-amber-500",
};

const statusBadgeClasses: Record<Shipment["status"], string> = {
  Scheduled: "border-muted bg-muted/50 text-muted-foreground",
  "In Transit": "border-primary/20 bg-primary/10 text-primary",
  "Out for Delivery": "border-primary/20 bg-primary/10 text-primary",
  Delivered: "border-green-600/20 bg-green-600/10 text-green-600",
  Delayed: "border-destructive/20 bg-destructive/10 text-destructive",
  "On Hold": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Customs Hold": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

type ShipmentDetailsProps = {
  shipment: Shipment | null;
};

function getContactLabel(mode: Shipment["mode"]) {
  if (mode === "land") {
    return "Call Driver";
  }

  if (mode === "air") {
    return "Call Airline Support";
  }

  return "Call Captain";
}

function getTransportNumberLabel(mode: Shipment["mode"]) {
  if (mode === "land") {
    return "Vehicle number";
  }

  if (mode === "air") {
    return "Flight number";
  }

  return "Vessel number";
}

function EmptyShipmentOverview() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed text-muted-foreground text-sm">
      Select a shipment to view details.
    </div>
  );
}

function ShipmentOverview({ shipment }: { shipment: Shipment }) {
  const ContactIcon = modeIcons[shipment.mode];
  const contactLabel = getContactLabel(shipment.mode);
  const transportNumberLabel = getTransportNumberLabel(shipment.mode);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-lg tabular-nums tracking-tight sm:text-xl">#{shipment.id}</h1>
          <Button variant="ghost" size="icon-sm" aria-label="Copy shipment ID">
            <Copy />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge variant="outline" className={cn("gap-1.5", statusBadgeClasses[shipment.status])}>
            <span className={cn("size-1.5 rounded-full bg-current", progressRingClasses[shipment.status])} />
            {shipment.status}
          </Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">{shipment.progress}% complete</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">
            ETA: {shipment.eta} {shipment.etaMeta}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-9 after:rounded-sm">
            <AvatarFallback className="rounded-sm">{shipment.customer.initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="font-medium text-sm leading-none">{shipment.customer.name}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs tabular-nums leading-none tracking-tight">{shipment.customer.id}</span>{" "}
              <Copy className="size-3" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">
            <Star />
            {shipment.customer.tier}
          </Badge>
          <div className="text-muted-foreground text-xs leading-none">{shipment.customer.tierLabel}</div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-medium">Cargo details</h2>

          <Button variant="outline" size="sm">
            <ContactIcon data-icon="inline-start" />
            {contactLabel}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-[1.35fr_1fr_1.1fr_1.15fr_1fr]">
          <div className="col-span-2 flex flex-col gap-1 md:col-span-1 md:gap-2">
            <div className="text-muted-foreground text-xs leading-none md:invisible md:text-sm">Cargo</div>
            <div className="whitespace-nowrap text-sm leading-none">{shipment.cargo}</div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">Total weight</div>
            <div className="text-sm leading-none">{shipment.weight}</div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">Transport mode</div>
            <div className="text-sm capitalize leading-none">
              {shipment.mode} · {shipment.routeType}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">{transportNumberLabel}</div>
            <div className="text-sm leading-none">{shipment.transportNumber}</div>
          </div>

          <div className="flex flex-col gap-2 md:text-right">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">Status</div>
            <div className="text-sm leading-none">{shipment.progress}% complete</div>
          </div>
        </div>
      </div>

      <Separator />

      <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
        <AlertTriangleIcon />
        <AlertTitle>{shipment.handling.label}</AlertTitle>
        <AlertDescription className="space-y-2">
          <div className="border-amber-900 text-amber-900 leading-none dark:border-amber-50 dark:text-amber-50">
            {shipment.handling.note}
          </div>

          <Separator className="bg-amber-800 dark:bg-amber-50" />

          <div className="flex flex-wrap gap-2">
            {shipment.handling.tags.map(({ icon: TagIcon, label }) => (
              <Badge
                className="rounded-sm border-amber-200 bg-background/50 text-amber-900 dark:border-amber-900 dark:text-amber-50"
                key={label}
                variant="outline"
              >
                <TagIcon data-icon="inline-start" />
                {label}
              </Badge>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  // Height state for resizable map container (default: 380px)
  const [mapHeight, setMapHeight] = useState<number>(380);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // Vertical drag-to-resize handlers
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = mapHeight;
  };

  useEffect(() => {
    const handleMouseMoveResize = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(120, Math.min(startHeightRef.current + deltaY, 680));
      setMapHeight(newHeight);
    };

    const handleMouseUpResize = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMoveResize);
      window.addEventListener("mouseup", handleMouseUpResize);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveResize);
      window.removeEventListener("mouseup", handleMouseUpResize);
    };
  }, [isResizing]);

  if (!shipment) {
    return (
      <div className="relative h-full w-full overflow-hidden flex flex-col min-h-0">
        <div style={{ height: isMapExpanded ? "100%" : `${mapHeight}px` }} className="w-full shrink-0 relative overflow-hidden transition-[height] duration-200">
          <ShipmentRouteMap shipment={null} />
        </div>
        {!isMapExpanded && (
          <div className="flex-1 min-h-0 overflow-hidden border-t bg-background p-4">
            <EmptyShipmentOverview />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden flex flex-col min-h-0 select-none">
      {/* Route Map Container */}
      <div
        style={{ height: isMapExpanded ? "100%" : `${mapHeight}px` }}
        className="w-full shrink-0 relative overflow-hidden transition-[height] duration-150 ease-out"
      >
        <ShipmentRouteMap shipment={shipment} />
      </div>

      {/* Resizable Divider Handle Bar (Tarik-tarik vertikal) */}
      {!isMapExpanded && (
        <div
          onMouseDown={handleMouseDownResize}
          className={cn(
            "group relative flex h-3 w-full cursor-row-resize items-center justify-center border-y bg-muted/60 hover:bg-primary/20 active:bg-primary/30 transition-colors z-20 shrink-0",
            isResizing && "bg-primary/30"
          )}
          title="Drag up or down to resize map & details panel"
        >
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
            <GripHorizontal className="size-4" />
          </div>
        </div>
      )}

      {/* Tabs & Details Panel Container (Sembunyi saat Map Expanded) */}
      {!isMapExpanded && (
        <div className="flex-1 min-h-0 border-t bg-background overflow-hidden flex flex-col z-10">
          <div className="h-full min-h-0 py-1 flex flex-col">
            <Tabs defaultValue="overview" className="h-full gap-0 flex flex-col">
              <div className="flex items-center justify-between border-b px-4 pr-3 shrink-0">
                <TabsList
                  className="justify-start gap-2 border-b-0 px-0 **:data-[slot=tabs-trigger]:text-xs sm:gap-4 sm:**:data-[slot=tabs-trigger]:text-sm"
                  variant="line"
                >
                  <TabsTrigger className="flex-none" value="overview">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="route">
                    Route
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="cargo">
                    Cargo
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="documents">
                    Documents
                  </TabsTrigger>
                  <TabsTrigger className="flex-none" value="activity">
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Single Expand / Collapse Toggle Button & Reset */}
                <div className="flex items-center gap-1.5 shrink-0 py-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-md shadow-none text-muted-foreground hover:text-foreground"
                    title="Expand Map Full Screen (Hide details panel)"
                    onClick={() => setIsMapExpanded(true)}
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                  {mapHeight !== 380 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-md shadow-none text-muted-foreground hover:text-foreground"
                      title="Reset Map Height (380px)"
                      onClick={() => setMapHeight(380)}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent className="min-h-0 overflow-auto p-4 flex-1" value="overview">
                <ShipmentOverview shipment={shipment} />
              </TabsContent>
              <TabsContent className="p-4 flex-1 overflow-auto" value="route">
                <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm py-12">
                  Route view coming soon.
                </div>
              </TabsContent>
              <TabsContent className="p-4 flex-1 overflow-auto" value="cargo">
                <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm py-12">
                  Cargo view coming soon.
                </div>
              </TabsContent>
              <TabsContent className="p-4 flex-1 overflow-auto" value="documents">
                <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm py-12">
                  Documents view coming soon.
                </div>
              </TabsContent>
              <TabsContent className="p-4 flex-1 overflow-auto" value="activity">
                <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm py-12">
                  Activity view coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Floating Toggle Button when Map is Full Screen (Expanded) */}
      {isMapExpanded && (
        <div className="absolute bottom-4 right-4 z-30">
          <Button
            variant="default"
            size="sm"
            className="gap-2 shadow-lg rounded-full px-4"
            onClick={() => setIsMapExpanded(false)}
          >
            <Minimize2 className="size-4" />
            <span>Show Details Panel</span>
          </Button>
        </div>
      )}
    </div>
  );
}
