"use client";

import { Button } from "@sarunyu/system-one";
import { SparkleIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { AssetPosture, MarketThemesCard } from "./PostureAndThemes";
import { StrategyPlaybooks } from "./StrategyPlaybooks";
import { RightSidebar } from "./RightSidebar";

export default function HouseViewPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline-black" size="sm" leftIcon={<DownloadSimpleIcon size={14} />}>CIO Report</Button>
        <Button variant="primary" size="sm" leftIcon={<SparkleIcon size={14} weight="fill" />}>Auto-Match Clients</Button>
      </div>

      {/* Top row: Asset Posture + Market Themes */}
      <div className="flex flex-col lg:grid gap-5 items-stretch" style={{ gridTemplateColumns: "320px 1fr" }}>
        <AssetPosture />
        <MarketThemesCard />
      </div>

      {/* Body: Playbooks + Sidebar */}
      <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
        <StrategyPlaybooks />
        <RightSidebar />
      </div>

    </div>
  );
}
