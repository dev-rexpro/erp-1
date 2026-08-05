import * as React from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { HeaderRight } from "@/components/layout/header-right";
import { Search } from "@/components/search";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { shipments } from "./data/shipment-data";
import { ShipmentDetails } from "./components/shipment-details";
import { ShipmentList } from "./components/shipment-list";

// Import flag icons styling
import "@/styles/flag-icons/flags.css";

export function CargoTracking() {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = React.useState<string | null>(shipments[0].id);
  const selectedShipment = shipments.find((shipment) => shipment.id === selectedShipmentId) ?? shipments[0];

  function handleSelectShipment(shipmentId: string) {
    setSelectedShipmentId(shipmentId);

    if (window.innerWidth < 1024) {
      setDetailsOpen(true);
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      {/* ===== Main Content Area ===== */}
      <Main fixed className="p-0">
        <div className="grid h-full w-full overflow-hidden lg:grid-cols-[400px_minmax(0,1fr)] lg:divide-x">
          <div className="h-full overflow-hidden">
            <ShipmentList
              shipments={shipments}
              selectedShipmentId={selectedShipmentId}
              onSelectShipment={handleSelectShipment}
            />
          </div>
          <div className="hidden h-full overflow-hidden lg:block">
            <ShipmentDetails shipment={selectedShipment} />
          </div>
        </div>
      </Main>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-full h-full p-0 gap-0 border-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedShipment ? `Shipment ${selectedShipment.id}` : "Shipment details"}</SheetTitle>
            <SheetDescription>Selected shipment details and route map.</SheetDescription>
          </SheetHeader>
          <ShipmentDetails shipment={selectedShipment} />
        </SheetContent>
      </Sheet>
    </>
  );
}
