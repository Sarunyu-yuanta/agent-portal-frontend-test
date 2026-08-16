"use client";

import { useState, Fragment } from "react";
import { Chip, Button, BottomSheet, Modal } from "@sarunyu/system-one";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { mockHouseViewStrategies } from "@/lib/mock-data";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PlaybookCard } from "./PlaybookCard";
import { PlaybookCardCompact } from "./PlaybookCardCompact";

// ─── Types & constants ────────────────────────────────────────────────────────

type AssetClassFilter =
  | "All"
  | "Hot issue"
  | "Buy list"
  | "Asset performance"
  | "Market calendar"
  | "Asset class outlook"
  | "Market outlook";

const ASSET_FILTERS: AssetClassFilter[] = [
  "All", "Hot issue", "Buy list", "Asset performance",
  "Market calendar", "Asset class outlook", "Market outlook",
];

const GRID_LIMIT = 4;

type Strategy = (typeof mockHouseViewStrategies)[number];
type PeriodGroup = { period: string; periodLabel: string; items: Strategy[] };
type ModalGroup = PeriodGroup | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByPeriodLabel(strategies: Strategy[]): PeriodGroup[] {
  const seen = new Set<string>();
  const order: { period: string; periodLabel: string }[] = [];
  for (const s of strategies) {
    const key = `${s.period}__${s.periodLabel}`;
    if (!seen.has(key)) {
      seen.add(key);
      order.push({ period: s.period, periodLabel: s.periodLabel });
    }
  }
  return order.map(({ period, periodLabel }) => ({
    period,
    periodLabel,
    items: strategies.filter((s) => s.period === period && s.periodLabel === periodLabel),
  }));
}

function periodBadgeLabel(period: string) {
  return period === "monthly" ? "Monthly" : "Weekly";
}

function modalTitle(group: PeriodGroup) {
  return `${periodBadgeLabel(group.period)} — ${group.periodLabel}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StrategyPlaybooks() {
  const [filter, setFilter] = useState<AssetClassFilter>("All");
  const [modalGroup, setModalGroup] = useState<ModalGroup>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const all = mockHouseViewStrategies;
  const filtered = filter === "All" ? all : all.filter((s) => s.category === filter);
  const isFiltered = filter !== "All";
  const groups = groupByPeriodLabel(filtered);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Filter chips */}
      <div className="-mx-4 xl:-mx-6 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap md:flex-wrap px-4 xl:px-6">
          {ASSET_FILTERS.map((f) => (
            <span key={f} className="shrink-0">
              <Chip label={f} type="single" size="small" selected={filter === f} onClick={() => setFilter(f)} />
            </span>
          ))}
        </div>
      </div>

      {/* Period groups */}
      {groups.map((group, idx) => {
        const isFirstMonthly = !isFiltered && idx === 0 && group.period === "monthly";
        const [featured, ...rest] = group.items;
        const gridItems = isFirstMonthly ? rest : group.items;
        const hasMore = gridItems.length > GRID_LIMIT;

        return (
          <Fragment key={`${group.period}-${group.periodLabel}`}>
            {idx > 0 && <div className="border-t border-border my-4" />}
            <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-primary-action-light text-primary-action text-[11px] font-bold">
                  {periodBadgeLabel(group.period)}
                </span>
                <p className="type-subtitle-1 font-bold text-foreground">{group.periodLabel}</p>
              </div>
              {(hasMore && !isFirstMonthly) || isFirstMonthly ? (
                <Button
                  size="sm"
                  variant="plain"
                  rightIcon={<ArrowRightIcon size={12} />}
                  onClick={() => setModalGroup(group)}
                  className={isFirstMonthly ? "lg:hidden" : ""}
                >
                  ดูทั้งหมด
                </Button>
              ) : null}
            </div>

            {isFirstMonthly ? (
              <>
                {/* Desktop: combined card */}
                <div className="hidden lg:flex rounded-2xl border border-border bg-card overflow-hidden flex-col lg:flex-row">
                  <div className="flex-1 min-w-0">
                    <PlaybookCard strategy={featured} noBorder />
                  </div>
                  {rest.length > 0 && (
                    <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-border lg:w-[45%] shrink-0 overflow-y-auto max-h-[306px] visible-scrollbar">
                      <div className="flex flex-col divide-y divide-border">
                        {rest.map((s) => (
                          <PlaybookCardCompact key={s.id} strategy={s} noBorder />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile: separate cards + view all */}
                <div className="flex flex-col gap-3 lg:hidden">
                  <PlaybookCard strategy={featured} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rest.slice(0, 3).map((s) => (
                      <PlaybookCardCompact key={s.id} strategy={s} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gridItems.slice(0, GRID_LIMIT).map((s) => (
                  <PlaybookCardCompact key={s.id} strategy={s} />
                ))}
              </div>
            )}
            </div>
          </Fragment>
        );
      })}

      {/* Mobile: BottomSheet */}
      <BottomSheet
        open={!!modalGroup && isMobile}
        onOpenChange={(o) => { if (!o) setModalGroup(null); }}
        title={modalGroup ? modalTitle(modalGroup) : ""}
        showHandle
        showHeader
        rightSide="none"
        contentClassName="overflow-y-auto"
      >
        <div className="flex flex-col gap-3 pb-8">
          {modalGroup?.items.map((s) => (
            <PlaybookCardCompact key={s.id} strategy={s} />
          ))}
        </div>
      </BottomSheet>

      {/* Desktop: centered modal */}
      {modalGroup && !isMobile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={() => setModalGroup(null)}
          role="presentation"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Modal
              variant="content"
              title={modalTitle(modalGroup)}
              showClose
              onClose={() => setModalGroup(null)}
              className="w-[calc(100vw-2rem)] max-w-[720px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar py-1">
                {modalGroup.items.map((s) => (
                  <PlaybookCardCompact key={s.id} strategy={s} />
                ))}
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}
