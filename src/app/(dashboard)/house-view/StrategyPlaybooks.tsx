"use client";

import { useState } from "react";
import { Tag, Button, Chip } from "@sarunyu/system-one";
import { SparkleIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { mockHouseViewStrategies } from "@/lib/mock-data";
import { ASSET_FILTERS, STRATEGY_DETAIL, type AssetClassFilter } from "./house-view-data";

function PlaybookCard({ strategy }: { strategy: (typeof mockHouseViewStrategies)[number] }) {
  const detail = STRATEGY_DETAIL[strategy.id];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex">
      {/* Left accent bar */}
      <div className="w-1 shrink-0" style={{
        background: strategy.conviction === "High" ? "var(--bg-brand-primary)" : strategy.conviction === "Medium" ? "var(--bg-warning-primary)" : "var(--bg-danger-primary)"
      }} />

      <div className="flex-1 p-6 flex flex-col gap-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Tag text={`${strategy.conviction.toUpperCase()} CONVICTION`} variant={strategy.convictionVariant} size="small" />
              <Tag text={strategy.assetClass.toUpperCase()} variant="gray" size="small" />
            </div>
            <p className="text-[20px] font-bold text-foreground leading-tight">{strategy.name}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Allocation</p>
            <p className="text-[22px] font-black text-foreground leading-none">{strategy.targetAllocation}</p>
          </div>
        </div>

        {/* Rationale + How to Pitch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategy Rationale</p>
            <p className="text-[12px] text-foreground leading-relaxed">{detail?.rationale}</p>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <SparkleIcon size={12} weight="fill" className="text-primary-action" />
              <p className="text-[11px] font-semibold text-foreground">How to Pitch</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {detail && [
                { label: "Hook", value: detail.hook },
                { label: "Objection", value: detail.objection },
                { label: "Response", value: detail.response },
              ].map((item) => (
                <p key={item.label} className="text-[11px] text-muted-foreground leading-snug">
                  <span className="font-semibold text-foreground">{item.label}: </span>{item.value}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Product table */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Approved Execution Products</p>
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px] bg-muted/50 px-4 py-2 border-b border-border">
              {["Product / Fund", "Risk", "Est. Yield/Ret.", "Action"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
              ))}
            </div>
            {detail?.products.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col gap-2 px-4 py-3 md:grid md:grid-cols-[1fr_80px_120px_100px] md:items-center ${i < (detail.products.length - 1) ? "border-b border-border" : ""}`}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.type}</p>
                </div>
                <span className={`text-[11px] font-semibold ${p.risk === "High" ? "text-destructive" : p.risk === "Medium" ? "text-warning" : "text-success"}`}>{p.risk}</span>
                <span className="text-[11px] text-foreground">{p.yield}</span>
                <Button variant="outline" size="sm">Add to Cart</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[...Array(Math.min(strategy.matchedClients, 3))].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">{strategy.matchedClients}</span> matched clients
            </p>
          </div>
          <Button variant="primary" size="sm" rightIcon={<ArrowRightIcon size={13} />}>
            View Clients &amp; Pitch
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StrategyPlaybooks() {
  const [filter, setFilter] = useState<AssetClassFilter>("All");
  const [chipsScrolled, setChipsScrolled] = useState(false);
  const filtered = mockHouseViewStrategies.filter((s) => filter === "All" || s.assetClass === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="type-subtitle-1 text-foreground">Strategy Playbooks</p>
        <div className="flex items-center gap-2 min-w-0 sm:shrink-0">
          <span className="text-[12px] text-muted-foreground shrink-0">Filter by:</span>
          <div className="relative flex-1 min-w-0 sm:flex-none">
            <div
              className="scrollable-tabs flex items-center gap-2 sm:overflow-visible"
              onScroll={(e) => setChipsScrolled(e.currentTarget.scrollLeft > 0)}
              style={chipsScrolled ? {
                maskImage: "linear-gradient(to right, transparent 0px, black 40px)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 40px)",
              } : undefined}
            >
              {ASSET_FILTERS.map((f) => (
                <Chip key={f} label={f} type="single" size="small" selected={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((s) => <PlaybookCard key={s.id} strategy={s} />)}
      </div>
    </div>
  );
}
