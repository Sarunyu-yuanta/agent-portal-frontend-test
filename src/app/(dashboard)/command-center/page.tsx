"use client";

import { useState } from "react";
import { Card } from "@sarunyu/system-one";
import { useClients, useNBAActions } from "@/hooks/use-api";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { KpiBar } from "./KpiBar";
import { NbaActionQueue } from "./NbaActionQueue";
import { ClientIntelligencePanel } from "./ClientIntelligencePanel";
import { AiProductMatch } from "./AiProductMatch";
import { MiniKanban } from "./MiniKanban";
import { AutomationLog } from "./AutomationLog";

export default function CommandCenterPage() {
  const clients = useClients();
  const strapiNBA = useNBAActions(clients);
  const [nbaActions, setNbaActions] = useState(strapiNBA);
  const [nbaSource, setNbaSource] = useState(strapiNBA);
  if (nbaSource !== strapiNBA) {
    setNbaSource(strapiNBA);
    setNbaActions(strapiNBA);
  }
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSelectClient(id: string) {
    setSelectedClientId(id);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* KPI Bar */}
        <KpiBar />

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Left — NBA Action Queue */}
          <div className="w-full lg:flex-[3] min-w-0">
            <NbaActionQueue
              actions={nbaActions}
              onDismiss={(id) =>
                setNbaActions((prev) => prev.filter((a) => a.id !== id))
              }
              onRefresh={() => setNbaActions(strapiNBA)}
              selectedId={selectedClientId}
              onSelect={handleSelectClient}
            />
          </div>

          {/* Right — AI Match + Pipeline + Automation */}
          <div className="w-full lg:flex-[2] min-w-0 flex flex-col gap-5">
            <AiProductMatch />
            <Card variant="default">
              <MiniKanban />
            </Card>
            <Card variant="default">
              <AutomationLog />
            </Card>
          </div>
        </div>
      </div>

      {/* Client Intelligence Drawer */}
      <DetailDrawer
        size="compact"
        className="overflow-y-auto"
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedClientId(null);
        }}
      >
        <ClientIntelligencePanel
          selectedId={selectedClientId}
          actions={nbaActions}
          onDismiss={(id) => {
            setNbaActions((prev) => prev.filter((a) => a.id !== id));
            setDrawerOpen(false);
            setSelectedClientId(null);
          }}
        />
      </DetailDrawer>
    </>
  );
}
