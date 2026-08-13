"use client";

import { Card, Tag, Button, List, ListItem } from "@sarunyu/system-one";
import {
  SparkleIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  PresentationChartIcon,
  ArrowsLeftRightIcon,
  ArrowsClockwiseIcon,
  CalendarCheckIcon,
} from "@phosphor-icons/react";
import { mockNBAActions } from "@/lib/mock-data";
import { CurrentAllocationSection, TopHoldingsSection } from "./ClientSections";
import type { SortDir, HoldingsSortKey } from "./client-detail-data";
import type { ClientDetail } from "@/types/domain";

type NbaAction = (typeof mockNBAActions)[number];

export function OverviewTab({
  detail,
  nbaAction,
  holdingsSortKey,
  holdingsSortDir,
  onSort,
}: {
  detail: ClientDetail;
  nbaAction: NbaAction | undefined;
  holdingsSortKey: HoldingsSortKey;
  holdingsSortDir: SortDir;
  onSort: (key: "value" | "pnlPct" | "pct", dir: SortDir) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start pt-8">

      {/* ── Left column (main) ── */}
      <div className="flex-[3] min-w-0 flex flex-col gap-6">

      {/* AI Intelligence — hidden for now */}
      {false && (
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SparkleIcon size={18} weight="fill" className="text-primary-action" />
          <h5 className="type-h5 text-foreground">AI Intelligence</h5>
        </div>

        {detail.aiHighPriority && (
          <div className="rounded-xl border border-border overflow-hidden flex bg-card">
            <div className="w-1 shrink-0 bg-red-400" />
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                <div className="flex flex-col gap-1.5">
                  <p className="type-subtitle-2 text-foreground leading-snug">{detail.aiHighPriority?.title}</p>
                  <Tag text="Revenue Opportunity" variant="green" size="small" />
                </div>
                <Tag text="HIGH" variant="red" size="small" />
              </div>
              <div className="mx-4 border-t border-[var(--border-divider)]" />
              <div className="px-4 py-3 flex flex-col gap-3">
                <p className="type-body-2 text-muted-foreground leading-snug">{detail.aiHighPriority?.message}</p>
                {nbaAction?.aiDraft && (
                  <div className="flex gap-2 bg-primary-action-light rounded-lg px-3 py-2.5">
                    <SparkleIcon size={14} className="text-primary-action shrink-0 mt-0.5" weight="fill" />
                    <p className="text-[13px] text-foreground leading-relaxed">{nbaAction?.aiDraft}</p>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {nbaAction?.revenueImpact.startsWith("฿") ? (
                    <div className="flex items-baseline gap-1.5">
                      <CurrencyCircleDollarIcon size={13} className="text-success shrink-0 translate-y-[1px]" weight="fill" />
                      <span className="text-[14px] font-bold text-success leading-none">{nbaAction?.revenueImpact.replace(" est. revenue", "")}</span>
                      <span className="text-[11px] text-muted-foreground leading-none">est. revenue</span>
                    </div>
                  ) : <span />}
                  <div className="flex items-center gap-2">
                    <Button variant="plain" size="sm">{detail.aiHighPriority?.secondaryAction}</Button>
                    <Button variant="primary" size="sm">{detail.aiHighPriority?.primaryAction}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {detail.aiRiskAlert && (
          <div className="rounded-xl border border-border overflow-hidden flex bg-card">
            <div className="w-1 shrink-0 bg-yellow-400" />
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                <div className="flex flex-col gap-1.5">
                  <p className="type-subtitle-2 text-foreground leading-snug">{detail.aiRiskAlert?.title}</p>
                  <Tag text="Compliance Risk" variant="red" size="small" />
                </div>
                <Tag text="MEDIUM" variant="yellow" size="small" />
              </div>
              <div className="mx-4 border-t border-[var(--border-divider)]" />
              <div className="px-4 py-3 flex flex-col gap-3">
                <p className="type-body-2 text-muted-foreground leading-snug">{detail.aiRiskAlert?.message}</p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <WarningCircleIcon size={13} className="text-warning shrink-0" weight="fill" />
                    <span className="text-[12px] font-medium text-warning leading-none">Requires immediate review</span>
                  </div>
                  <Button variant="outline" size="sm">{detail.aiRiskAlert?.action}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!detail.aiHighPriority && !detail.aiRiskAlert && (
          <div className="rounded-xl border border-border overflow-hidden flex bg-card">
            <div className="w-1 shrink-0 bg-border" />
            <div className="flex items-center gap-3 px-4 py-4">
              <SparkleIcon size={16} weight="duotone" className="text-muted-foreground" />
              <p className="type-body-2 text-muted-foreground">All caught up — no pending actions.</p>
            </div>
          </div>
        )}
      </section>
      )}

        {/* Current Allocation */}
        <Card variant="default">
          <div className="flex flex-col gap-4">
            <h6 className="type-h6 text-foreground">Current Allocation</h6>
            <CurrentAllocationSection slices={detail.assetSummary?.allocationSlices ?? []} />
          </div>
        </Card>

        {/* Top Holdings */}
        <Card variant="default">
          <div className="flex flex-col gap-4">
            <h6 className="type-h6 text-foreground">Top Holdings</h6>
            <TopHoldingsSection
              holdings={detail.topHoldings}
              sortKey={holdingsSortKey}
              sortDir={holdingsSortDir}
              onSort={onSort}
            />
          </div>
        </Card>

      </div>{/* end left column */}

      {/* ── Right column (sidebar) ── */}
      <div className="flex-[2] min-w-0 flex flex-col gap-5">

        {/* Quick Trade & Propose — hidden for now */}
        {false && (
        <Card variant="default">
          <div className="flex flex-col gap-3">
            <h6 className="type-h6 text-foreground">Quick Trade & Propose</h6>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <PresentationChartIcon size={18} />
                Build New Proposal
              </button>
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-2.5 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
              >
                <ArrowsLeftRightIcon size={18} />
                Execute Trade / Order
              </button>
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-2.5 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
              >
                <ArrowsClockwiseIcon size={18} />
                Simulate Rebalance
              </button>
            </div>
          </div>
        </Card>
        )}

        {/* Behavioral Profile — hidden for now */}
        {false && (
        <Card variant="default">
          <div className="flex flex-col gap-4">
            <h6 className="type-h6 text-foreground">Behavioral Profile</h6>
            <List>
              {detail.behavioralProfile.map((item) => (
                <ListItem key={item.label} label={item.label} trailing={item.value} />
              ))}
            </List>
          </div>
        </Card>
        )}

        {/* Reminders */}
        <Card variant="default">
          <div className="flex flex-col gap-4">
            <h6 className="type-h6 text-foreground">Reminders</h6>
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CalendarCheckIcon size={32} className="text-muted-foreground/40" weight="duotone" />
              <p className="type-body-2 text-muted-foreground">ยังไม่มี reminder</p>
              <p className="type-caption text-muted-foreground/60">ฟีเจอร์นี้กำลังจะมาเร็วๆ นี้</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="default">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h6 className="type-h6 text-foreground">Recent Activity</h6>
            </div>
            <div className="flex flex-col">
              {detail.recentActivity.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0 w-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${item.dotColor}`} />
                    {i < detail.recentActivity.length - 1 && <div className="w-px flex-1 bg-border my-1.5" />}
                  </div>
                  <div className={`flex flex-col gap-0.5 ${i < detail.recentActivity.length - 1 ? "pb-5" : ""}`}>
                    <p className="type-subtitle-2 text-foreground leading-snug">{item.label}</p>
                    <p className="type-body-2 text-muted-foreground leading-snug">{item.description}</p>
                    <p className="type-caption text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <Button variant="plain" size="sm" leftIcon={<CalendarCheckIcon size={14} />}>View all activity</Button>
            </div>
          </div>
        </Card>

      </div>{/* end right column */}

    </div>
  );
}
