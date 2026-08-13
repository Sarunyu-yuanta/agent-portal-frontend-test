"use client";

import { KpiRow } from "./KpiRow";
import {
  IncomeTracker,
  PipelineCoverage,
  CrossSellDiagnostics,
  ClientEngagement,
  OutcomeSimulator,
} from "./MainColumn";
import { DarkSidebar } from "./DarkSidebar";

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-5">

      {/* KPI row */}
      <KpiRow />

      {/* Body: main 2-col + dark sidebar */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_300px] items-start">

        {/* Main content */}
        <div className="flex flex-col gap-5">
          {/* Row 1: Income + Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <IncomeTracker />
            <PipelineCoverage />
          </div>

          {/* Row 2: Cross-sell + Engagement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <CrossSellDiagnostics />
            <ClientEngagement />
          </div>

          {/* Row 3: Outcome Simulator full-width */}
          <OutcomeSimulator />
        </div>

        {/* Dark navy sidebar — stretches full height */}
        <DarkSidebar />

      </div>
    </div>
  );
}
