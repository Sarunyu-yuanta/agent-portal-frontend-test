"use client";

import { Button } from "@sarunyu/system-one";
import { usePrivacy } from "@/contexts/privacy-context";
import { useClients, useMiniKanban } from "@/hooks/use-api";
import { maskName } from "@/lib/mask-name";
import { KANBAN_STAGES, type KanbanStage } from "./command-center-data";

const STAGE_CONFIG: Record<
  KanbanStage,
  { bar: string; dot: string; shortLabel: string }
> = {
  Idea: {
    bar: "bg-slate-300 dark:bg-slate-600",
    dot: "bg-slate-400",
    shortLabel: "Idea",
  },
  Pitch: { bar: "bg-blue-400", dot: "bg-blue-500", shortLabel: "Pitch" },
  "Client Review": {
    bar: "bg-amber-400",
    dot: "bg-amber-500",
    shortLabel: "Review",
  },
  Executed: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    shortLabel: "Closed",
  },
};

export function MiniKanban() {
  const { isPrivate } = usePrivacy();
  const clients = useClients();
  const miniKanban = useMiniKanban(clients);
  const stageStats = KANBAN_STAGES.map((stage) => {
    const deals = miniKanban.filter((d) => d.stage === stage);
    const aum = deals.reduce((sum, d) => {
      const m = d.dealSize?.match(/฿\s*([\d.]+)/);
      return sum + (m ? parseFloat(m[1]) : 0);
    }, 0);
    return { stage: stage as KanbanStage, count: deals.length, aum };
  });

  const maxAum = Math.max(...stageStats.map((s) => s.aum), 1);
  const BAR_MAX_H = 52;

  const sortedDeals = [...miniKanban].sort(
    (a, b) =>
      KANBAN_STAGES.indexOf(a.stage as KanbanStage) -
      KANBAN_STAGES.indexOf(b.stage as KanbanStage),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="type-subtitle-1 text-foreground">Pipeline</p>
          <p className="type-caption text-muted-foreground">
            ฿ 400M · {miniKanban.length} active deals
          </p>
        </div>
        <Button variant="plain" size="sm">
          View All
        </Button>
      </div>

      {/* Stage bar chart — instant visual encoding (Pipedrive pattern) */}
      <div className="flex items-end gap-2">
        {stageStats.map(({ stage, count, aum }, idx) => {
          const cfg = STAGE_CONFIG[stage];
          const barH =
            count > 0
              ? Math.max(Math.round((aum / maxAum) * BAR_MAX_H), 10)
              : 4;
          const isLast = idx === stageStats.length - 1;

          return (
            <div
              key={stage}
              className="flex-1 flex flex-col items-center gap-1.5 relative"
            >
              {/* AUM label above bar */}
              <p
                className={`text-[10px] font-bold leading-none ${count > 0 ? "text-foreground" : "text-transparent"}`}
              >
                ฿{aum}M
              </p>
              {/* Bar container (fixed height so all align to same baseline) */}
              <div
                className="w-full flex flex-col justify-end"
                style={{ height: BAR_MAX_H }}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-all ${count > 0 ? cfg.bar : "bg-muted/40 rounded-[4px]"}`}
                  style={{ height: barH }}
                />
              </div>
              {/* Stage label */}
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none text-center">
                {cfg.shortLabel}
              </p>
              {/* Deal count */}
              <p className="text-[9px] text-muted-foreground leading-none">
                {count === 0 ? "—" : `${count} deal${count > 1 ? "s" : ""}`}
              </p>

              {/* Connecting arrow between bars */}
              {!isLast && (
                <span className="absolute right-[-8px] bottom-[6px] text-[14px] text-muted-foreground/50 select-none leading-none">
                  ›
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-divider)]" />

      {/* Deal list — no stage tag needed, color dot identifies stage */}
      <div className="flex flex-col gap-0.5">
        {sortedDeals.map((item) => {
          const stage = item.stage as KanbanStage;
          const cfg = STAGE_CONFIG[stage];
          const amount = item.dealSize ?? "";
          const product = item.dealName ?? "";

          return (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground leading-tight truncate">
                  {maskName(item.client, isPrivate)}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">
                  {product}
                </p>
              </div>
              <p className="text-[12px] font-bold text-foreground shrink-0">
                {amount}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
