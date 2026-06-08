"use client";

import { use, useState, useEffect } from "react";
import {
  Avatar,
  Tag,
  Button,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Checkbox,
  List,
  ListItem,
} from "@sarunyu/system-one";
import {
  PhoneIcon,
  ChatCircleIcon,
  DownloadSimpleIcon,
  SparkleIcon,
  FileTextIcon,
  ArrowsClockwiseIcon,
  ArrowsLeftRightIcon,
  PresentationChartIcon,
  PlusIcon,
  CalendarCheckIcon,
  PencilSimpleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails, mockNBAActions } from "@/lib/mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type SortDir = "none" | "asc" | "desc";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const client = mockClients.find((c) => c.id === id) ?? mockClients[0];
  const detail = mockClientDetails[client.id] ?? mockClientDetails["1"];

  // Task state (interactive checkboxes)
  const [tasks, setTasks] = useState(detail.tasks);

  // Holdings sort state
  const [holdingsSortDir, setHoldingsSortDir] = useState<SortDir>("none");
  const [holdingsSortKey, setHoldingsSortKey] = useState<
    "value" | "pnlPct" | "pct" | null
  >(null);

  // Tier tag variant
  const tierVariant =
    client.tier === "UHNW" ? ("blue" as const) : ("gray" as const);

  // Status dot
  const statusDot =
    client.status === "success"
      ? "bg-[var(--bg-success-primary)]"
      : client.status === "error"
        ? "bg-[var(--bg-danger-primary)]"
        : client.status === "hold"
          ? "bg-[var(--bg-warning-primary)]"
          : "bg-[var(--bg-brand-primary)]";

  const statusLabel =
    client.status === "success"
      ? "Healthy"
      : client.status === "error"
        ? "Urgent Action"
        : client.status === "hold"
          ? "Needs Attention"
          : "In Progress";


  // NBA action for this client (provides aiDraft + revenueImpact for AI cards)
  const nbaAction = mockNBAActions.find((a) => a.clientName === client.name);


  // Compact sticky header on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      const top = main.scrollTop;
      setScrolled((prev) => {
        if (prev && top <= 4) return false;   // expand only when back near top
        if (!prev && top > 12) return true;   // collapse after 12px — dead zone prevents jitter
        return prev;
      });
    };
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col -mt-6">
      {/* Sticky Identity + KPI bar */}
      <div className="sticky -top-6 z-20 -mx-[9999px] px-[9999px] bg-card border-b border-border">
        <div className={`flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 lg:gap-8 transition-[padding] duration-300 ease-out ${scrolled ? "py-3" : "py-5"}`}>

          {/* Left: identity + actions */}
          <div className="flex flex-col gap-4">

            {/* Avatar + identity */}
            <div className={`flex gap-4 ${scrolled ? "items-center" : "items-start"}`}>
              {!scrolled && (
                <div className="shrink-0">
                  <Avatar type="text" initials={getInitials(client.name)} size="xxl" />
                </div>
              )}
              <div className="flex flex-col">
                {/* Name + Tier + Status pill */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="type-h4 text-foreground leading-none">{client.name}</h4>
                  <Tag text={client.tier} variant={tierVariant} size="small" />
                  <div className="flex items-center gap-1.5 border border-border rounded-full px-2 py-0.5 bg-background">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
                    <span className="type-caption text-foreground">{statusLabel}</span>
                  </div>
                </div>
                {/* Metadata — collapses when scrolled */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex items-center gap-5 mt-0.5">
                      <span className="type-caption text-muted-foreground">Risk: {client.riskProfile}</span>
                      <span className="type-caption text-muted-foreground">Last Contact: {client.lastContact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" leftIcon={<PhoneIcon size={16} />}>Call</Button>
              <Button variant="outline" size="sm" leftIcon={<ChatCircleIcon size={16} />}>Message</Button>
              <Button variant="primary" size="sm" leftIcon={<FileTextIcon size={16} />}>Create Proposal</Button>
            </div>
          </div>

          {/* Right: KPIs — fade between sizes */}
          <div className="flex items-center shrink-0 w-full lg:w-auto">
            <div className="flex flex-col items-end gap-1 pr-8">
              <p className="type-caption text-muted-foreground">Total AUM</p>
              <p className={`text-foreground transition-opacity duration-150 ${scrolled ? "type-subtitle-1" : "type-h3"}`}>{client.aum}</p>
            </div>
            <div className="w-px bg-border self-stretch my-1 shrink-0" />
            <div className="flex flex-col items-end gap-1 pl-8">
              <p className="type-caption text-muted-foreground">YTD P&L</p>
              <div className="flex items-center gap-1.5">
                {client.plPositive ? (
                  <ArrowUpIcon size={scrolled ? 14 : 18} className="text-success shrink-0" weight="bold" />
                ) : (
                  <ArrowDownIcon size={scrolled ? 14 : 18} className="text-destructive shrink-0" weight="bold" />
                )}
                <p className={`transition-opacity duration-150 ${scrolled ? "type-subtitle-1" : "type-h3"} ${client.plPositive ? "text-success" : "text-destructive"}`}>{client.plYtd}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body content ── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start pt-8">

        {/* ── Left column (main) ── */}
        <div className="flex-[3] min-w-0 flex flex-col gap-6">

        {/* AI Intelligence */}
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
                    <p className="type-subtitle-2 text-foreground leading-snug">{detail.aiHighPriority.title}</p>
                    <Tag text="Revenue Opportunity" variant="green" size="small" />
                  </div>
                  <Tag text="HIGH" variant="red" size="small" />
                </div>
                <div className="mx-4 border-t border-[var(--border-divider)]" />
                <div className="px-4 py-3 flex flex-col gap-3">
                  <p className="type-body-2 text-muted-foreground leading-snug">{detail.aiHighPriority.message}</p>
                  {nbaAction?.aiDraft && (
                    <div className="flex gap-2 bg-primary-action-light rounded-lg px-3 py-2.5">
                      <SparkleIcon size={14} className="text-primary-action shrink-0 mt-0.5" weight="fill" />
                      <p className="text-[13px] text-foreground leading-relaxed">{nbaAction.aiDraft}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {nbaAction?.revenueImpact.startsWith("฿") ? (
                      <div className="flex items-baseline gap-1.5">
                        <CurrencyCircleDollarIcon size={13} className="text-success shrink-0 translate-y-[1px]" weight="fill" />
                        <span className="text-[14px] font-bold text-success leading-none">{nbaAction.revenueImpact.replace(" est. revenue", "")}</span>
                        <span className="text-[11px] text-muted-foreground leading-none">est. revenue</span>
                      </div>
                    ) : <span />}
                    <div className="flex items-center gap-2">
                      <Button variant="plain" size="sm">{detail.aiHighPriority.secondaryAction}</Button>
                      <Button variant="primary" size="sm">{detail.aiHighPriority.primaryAction}</Button>
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
                    <p className="type-subtitle-2 text-foreground leading-snug">{detail.aiRiskAlert.title}</p>
                    <Tag text="Compliance Risk" variant="red" size="small" />
                  </div>
                  <Tag text="MEDIUM" variant="yellow" size="small" />
                </div>
                <div className="mx-4 border-t border-[var(--border-divider)]" />
                <div className="px-4 py-3 flex flex-col gap-3">
                  <p className="type-body-2 text-muted-foreground leading-snug">{detail.aiRiskAlert.message}</p>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <WarningCircleIcon size={13} className="text-warning shrink-0" weight="fill" />
                      <span className="text-[12px] font-medium text-warning leading-none">Requires immediate review</span>
                    </div>
                    <Button variant="outline" size="sm">{detail.aiRiskAlert.action}</Button>
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

          {/* Current Allocation */}
          <Card variant="default">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h6 className="type-h6 text-foreground">Current Allocation</h6>
                <Button variant="outline-black" size="sm" rightIcon={<DownloadSimpleIcon size={15} />}>Report</Button>
              </div>
              {/* Stacked allocation bar */}
              <div className="flex flex-col gap-3">
                <div className="flex h-4 rounded-full overflow-hidden">
                  {detail.allocationData.map((slice) => (
                    <div key={slice.name} style={{ width: `${slice.value}%`, backgroundColor: slice.fill }} />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  {detail.allocationData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.fill }} />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        {slice.name} ({slice.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation KPI tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {detail.allocationBreakdown.map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`flex flex-col gap-1 rounded-xl p-3 ${kpi.warning ? "bg-[var(--bg-warning-light)] border border-[var(--border-warning)]" : "bg-[var(--bg-default-secondary)]"}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-[11px] font-semibold uppercase tracking-wide ${kpi.warning ? "text-[var(--text-warning-primary)]" : "text-muted-foreground"}`}>{kpi.label}</p>
                      {kpi.warning && <WarningCircleIcon size={13} className="text-[var(--text-warning-primary)] shrink-0" weight="fill" />}
                    </div>
                    <p className={`type-subtitle-1 font-bold leading-none ${kpi.warning ? "text-[var(--text-warning-primary)]" : "text-foreground"}`}>{kpi.value}</p>
                    <p className={`text-[12px] font-medium leading-none ${kpi.ytdPositive ? "text-success" : "text-destructive"}`}>
                      {kpi.warning ? kpi.warning : `${kpi.ytd} YTD`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Holdings */}
          <Card variant="default">
            <div className="flex flex-col gap-4">
              <h6 className="type-h6 text-foreground">Top Holdings</h6>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell sortable={false}>Asset</TableHeaderCell>
                    <TableHeaderCell
                      sortDirection={holdingsSortKey === "value" ? holdingsSortDir : "none"}
                      onSortChange={(d) => { setHoldingsSortKey(d === "none" ? null : "value"); setHoldingsSortDir(d); }}
                    >
                      Market Value
                    </TableHeaderCell>
                    <TableHeaderCell
                      sortDirection={holdingsSortKey === "pnlPct" ? holdingsSortDir : "none"}
                      onSortChange={(d) => { setHoldingsSortKey(d === "none" ? null : "pnlPct"); setHoldingsSortDir(d); }}
                    >
                      Unrealized P&L
                    </TableHeaderCell>
                    <TableHeaderCell
                      sortDirection={holdingsSortKey === "pct" ? holdingsSortDir : "none"}
                      onSortChange={(d) => { setHoldingsSortKey(d === "none" ? null : "pct"); setHoldingsSortDir(d); }}
                    >
                      % Portfolio
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.topHoldings.map((h) => (
                    <TableRow key={h.asset}>
                      <TableCell><span className="type-body-2 text-foreground font-medium">{h.asset}</span></TableCell>
                      <TableCell><span className="type-body-2 text-foreground">{h.value}</span></TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`type-body-2 font-medium ${h.positive ? "text-success" : "text-destructive"}`}>{h.pnl}</span>
                          <span className={`type-caption ${h.positive ? "text-success" : "text-destructive"}`}>{h.pnlPct}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="type-body-2 text-foreground">{h.pct}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

        </div>{/* end left column */}

        {/* ── Right column (sidebar) ── */}
        <div className="flex-[2] min-w-0 flex flex-col gap-5">

          {/* Quick Trade & Propose */}
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

          {/* Behavioral Profile */}
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

          {/* Tasks & Reminders */}
          <Card variant="default">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h6 className="type-h6 text-foreground">Tasks & Reminders</h6>
                <Button variant="plain" size="sm" leftIcon={<PlusIcon size={14} />}>Add Task</Button>
              </div>
              <div className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Checkbox
                        checked={task.done}
                        onChange={(checked) => setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !!checked } : t))}
                      />
                    </div>
                    <span className={`type-body-2 flex-1 leading-snug ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.task}
                    </span>
                    {task.urgent && !task.done && <Tag variant="red" size="small" text="Urgent" />}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="default">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h6 className="type-h6 text-foreground">Recent Activity</h6>
                <Button variant="plain" size="sm" leftIcon={<PencilSimpleIcon size={14} />}>Add Note</Button>
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

      </div>{/* end 2-col */}
    </div>
  );
}
