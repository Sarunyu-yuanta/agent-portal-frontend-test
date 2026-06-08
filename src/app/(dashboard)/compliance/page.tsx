"use client";

import { useState, useRef } from "react";
import {
  Card,
  Tag,
  StatusTag,
  Button,
  Avatar,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@sarunyu/system-one";
import {
  ShieldCheckIcon,
  WarningCircleIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  SparkleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowRightIcon,
  LockSimpleIcon,
  PaperPlaneRightIcon,
  BellSimpleIcon,
  UploadSimpleIcon,
  CalendarPlusIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { mockComplianceAlerts, mockKYCData } from "@/lib/mock-data";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// ─── KPI Bar ──────────────────────────────────────────────────────────────────

function KpiBar() {
  const kpis = [
    {
      label: "Critical Alerts",
      value: "2",
      sub: "Require immediate action",
      Icon: XCircleIcon,
      variant: "red" as const,
      valueColor: "text-destructive",
    },
    {
      label: "Pending KYC",
      value: "3",
      sub: "Documents outstanding",
      Icon: FileTextIcon,
      variant: "yellow" as const,
      valueColor: "text-foreground",
    },
    {
      label: "Suitability Flags",
      value: "1",
      sub: "Trade blocked",
      Icon: ShieldCheckIcon,
      variant: "red" as const,
      valueColor: "text-foreground",
    },
    {
      label: "Expiring in 30 Days",
      value: "2",
      sub: "Malee · Wichai",
      Icon: ClockIcon,
      variant: "yellow" as const,
      valueColor: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {kpis.map((k) => (
        <Card key={k.label} variant="default" className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <p className="type-caption text-muted-foreground">{k.label}</p>
            <Tag text={k.value} variant={k.variant} size="small" />
          </div>
          <p className={`type-h3 leading-none ${k.valueColor}`}>{k.value}</p>
          <p className="type-caption text-[var(--text-default-disabled)]">{k.sub}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── Alert Cards ──────────────────────────────────────────────────────────────

const ALERT_META = {
  critical: { label: "Critical", variant: "red"    as const, color: "var(--text-danger-primary)", accentColor: "var(--text-danger-primary)", bg: "var(--bg-danger-light)", Icon: XCircleIcon },
  warning:  { label: "Warning",  variant: "yellow" as const, color: "var(--text-warning-primary)", accentColor: "var(--text-warning-primary)", bg: "var(--bg-warning-light)", Icon: WarningCircleIcon },
};

const ALERT_TIMESTAMPS = ["2 hrs ago", "3 hrs ago", "5 hrs ago", "Today"];

function AlertCards() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Section header — inside the card */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border">
          <p className="type-subtitle-1 text-foreground">Active Compliance Alerts</p>
          <Tag text="4 open" variant="red" size="small" />
        </div>
        {mockComplianceAlerts.map((alert, i) => {
          const meta = ALERT_META[alert.type as keyof typeof ALERT_META] ?? ALERT_META.warning;
          const Icon = meta.Icon;
          const isPrimary = alert.action1 === "Escalate to Compliance" || alert.action1 === "Maintain Block";
          const isLast = i === mockComplianceAlerts.length - 1;

          return (
            <div
              key={alert.id}
              className={`hover:bg-muted/30 transition-colors ${!isLast ? "border-b border-border" : ""}`}
            >
              {/* ── Mobile layout ── */}
              <div className="flex flex-col gap-2 px-4 py-4 lg:hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg }}>
                      <Icon size={13} weight="fill" style={{ color: meta.color }} />
                    </div>
                    <Tag text={meta.label} variant={meta.variant} size="small" />
                    <span className="type-caption text-muted-foreground">{alert.client}</span>
                  </div>
                  <span className="type-caption text-muted-foreground shrink-0">{ALERT_TIMESTAMPS[i]}</span>
                </div>
                <p className="text-[14px] font-semibold text-foreground leading-snug">{alert.title}</p>
                <p className="type-body-2 text-muted-foreground leading-snug">{alert.message}</p>
                <div className="flex items-center justify-end gap-2">
                  {alert.action2 && <Button variant="plain" size="sm">{alert.action2}</Button>}
                  <Button variant={isPrimary ? "primary" : "outline"} size="sm">{alert.action1}</Button>
                </div>
              </div>

              {/* ── Desktop layout (original) ── */}
              <div className="hidden lg:flex">
                <div className="w-1 shrink-0" style={{ background: meta.accentColor }} />
                <div className="flex items-start gap-4 px-5 py-4 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: meta.bg }}>
                    <Icon size={16} weight="fill" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-semibold text-foreground leading-snug">{alert.title}</p>
                      <span className="type-caption text-muted-foreground shrink-0">{ALERT_TIMESTAMPS[i]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag text={meta.label} variant={meta.variant} size="small" />
                      <span className="type-caption text-muted-foreground">{alert.client}</span>
                    </div>
                    <p className="type-body-2 text-muted-foreground leading-snug">{alert.message}</p>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <span />
                      <div className="flex items-center gap-2 shrink-0">
                        {alert.action2 && <Button variant="plain" size="sm">{alert.action2}</Button>}
                        <Button variant={isPrimary ? "primary" : "outline"} size="sm">{alert.action1}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── KYC Pipeline Table ───────────────────────────────────────────────────────

const kycFilterOpts = [
  { value: "", label: "All Statuses" },
  { value: "success",    label: "Verified" },
  { value: "processing", label: "Processing" },
  { value: "hold",       label: "On Hold" },
  { value: "error",      label: "Expired" },
];

type SortKey = "client" | "riskRating" | "nextReview" | "daysUntilExpiry";
type SortDir = "none" | "asc" | "desc";

function KycTable() {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [selectedRow, setSelectedRow] = useState<KycRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chipsScrolled, setChipsScrolled] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  const handleSort = (key: SortKey) => (dir: SortDir) => {
    setSortKey(dir === "none" ? null : key);
    setSortDir(dir);
  };

  const dirFor = (key: SortKey): SortDir => sortKey === key ? sortDir : "none";

  const filtered = filter ? mockKYCData.filter((r) => r.kycStatus === filter) : mockKYCData;

  const rows = [...filtered].sort((a, b) => {
    if (!sortKey || sortDir === "none") return 0;
    let av: string | number = a[sortKey];
    let bv: string | number = b[sortKey];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <p className="type-subtitle-1 text-foreground">KYC & Document Pipeline</p>
        <Button variant="outline-black" size="sm" leftIcon={<DownloadSimpleIcon size={14} />}>
          Export
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="type-caption text-muted-foreground shrink-0">Filter by:</span>
        <div className="relative flex-1 min-w-0">
          <div
            className="scrollable-tabs flex items-center gap-2"
            onScroll={(e) => setChipsScrolled(e.currentTarget.scrollLeft > 0)}
            style={chipsScrolled ? {
              maskImage: "linear-gradient(to right, transparent 0px, black 40px)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 40px)",
            } : undefined}
          >
            {kycFilterOpts.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                type="single"
                size="small"
                selected={filter === opt.value}
                onClick={() => setFilter(opt.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden overflow-x-auto">
        <Table className="table-fixed min-w-[560px]">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-[26%]" sortDirection={dirFor("client")} onSortChange={handleSort("client")}>Client</TableHeaderCell>
              <TableHeaderCell className="w-[18%]" sortDirection={dirFor("riskRating")} onSortChange={handleSort("riskRating")}>Risk Rating</TableHeaderCell>
              <TableHeaderCell className="w-[16%]" sortable={false}>KYC Status</TableHeaderCell>
              <TableHeaderCell className="w-[22%]" sortDirection={dirFor("nextReview")} onSortChange={handleSort("nextReview")}>Next Review</TableHeaderCell>
              <TableHeaderCell className="w-[18%]" sortDirection={dirFor("daysUntilExpiry")} onSortChange={handleSort("daysUntilExpiry")}>Expiry</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const urgent = row.daysUntilExpiry <= 7;
              const soon   = row.daysUntilExpiry <= 30;
              const initials = row.client.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

              return (
                <TableRow key={row.id} hoverable className="cursor-pointer" onClick={() => { setSelectedRow(row); setDrawerOpen(true); }}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar type="text" initials={initials} size="s" />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="type-body-2 font-medium text-foreground truncate">{row.client}</span>
                        <span className="type-caption text-[var(--text-default-disabled)]">{row.riskRating} Risk</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tag
                      text={row.riskRating}
                      variant={row.riskRating === "High" ? "red" : row.riskRating === "Medium" ? "yellow" : "green"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusTag type={row.kycStatus} />
                  </TableCell>
                  <TableCell>
                    <span className="type-body-2 text-foreground">{row.nextReview}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {urgent && <ClockIcon size={12} weight="fill" className="text-destructive shrink-0" />}
                      <span className={`type-body-2 font-medium tabular-nums ${
                        urgent ? "text-destructive" : soon ? "text-warning" : "text-success"
                      }`}>
                        {row.daysUntilExpiry}d
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>

    <Sheet modal={false} open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setSelectedRow(null); }}>
      <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] overflow-y-auto p-0">
        {selectedRow && <KycDetailPanel row={selectedRow} onClose={() => setDrawerOpen(false)} />}
      </SheetContent>
    </Sheet>
    </>
  );
}

// ─── AI Compliance Guide (dark sidebar) ──────────────────────────────────────

const GUIDE_STEPS = [
  { n: 1, text: "Review client transaction history for anomalies" },
  { n: 2, text: "Cross-reference sanctions & adverse media databases" },
  { n: 3, text: "Prepare & upload documentation checklist" },
  { n: 4, text: "Escalate to compliance officer with full report" },
];

function AiGuide() {
  const [question, setQuestion] = useState("");

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-5 sticky top-6" style={{ background: "#1e2337" }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <SparkleIcon size={14} weight="fill" style={{ color: "var(--text-brand-primary)" }} />
        <p className="text-[13px] font-semibold text-white">AI Compliance Guide</p>
      </div>

      {/* Active alert context */}
      <div
        className="rounded-xl px-4 py-3 flex flex-col gap-1"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-danger-primary)" }}>Active Alert</p>
        <p className="text-[12px] font-semibold text-white leading-snug">Unsuitable Trade Blocked</p>
        <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>Malee Pongpipat · Risk mismatch</p>
      </div>

      {/* Resolution steps */}
      <div className="flex flex-col gap-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
        <p className="text-[11px] font-semibold text-white mb-2">Resolution Steps</p>
        {GUIDE_STEPS.map((s) => (
          <div key={s.n} className="flex gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)" }}
            >
              <span className="text-[10px] font-bold" style={{ color: "var(--text-brand-primary)" }}>{s.n}</span>
            </div>
            <p className="text-[11px] leading-snug flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2">
        {[
          { icon: LockSimpleIcon, label: "Sanctions Database", sub: "Search adverse media" },
          { icon: FileTextIcon,   label: "Doc Checklist",      sub: "KYC requirements" },
          { icon: ShieldCheckIcon, label: "Escalation Form",   sub: "Compliance officer" },
        ].map((l) => {
          const Icon = l.icon;
          return (
            <button
              key={l.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-left transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <Icon size={14} style={{ color: "rgba(255,255,255,0.45)" }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white">{l.label}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{l.sub}</p>
              </div>
              <ArrowRightIcon size={11} style={{ color: "rgba(255,255,255,0.25)" }} className="shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Ask AI */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 mt-auto"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <input
          type="text"
          placeholder="Ask compliance AI…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/30 outline-none"
        />
        <button
          className="shrink-0 cursor-pointer transition-opacity hover:opacity-70"
          onClick={() => setQuestion("")}
        >
          <PaperPlaneRightIcon size={14} weight="fill" style={{ color: question ? "#818cf8" : "rgba(255,255,255,0.25)" }} />
        </button>
      </div>
    </div>
  );
}

// ─── KYC Detail Drawer ───────────────────────────────────────────────────────

type KycRow = (typeof mockKYCData)[number];

function KycDetailPanel({ row, onClose }: { row: KycRow; onClose: () => void }) {
  const urgent = row.daysUntilExpiry <= 7;
  const soon   = row.daysUntilExpiry <= 30;
  const initials = row.client.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const kpis = [
    { label: "KYC Status",   value: <StatusTag type={row.kycStatus} /> },
    { label: "Risk Rating",  value: <Tag text={row.riskRating} variant={row.riskRating === "High" ? "red" : row.riskRating === "Medium" ? "yellow" : "green"} size="small" /> },
    { label: "Next Review",  value: row.nextReview,       accent: null },
    { label: "Expiry",       value: `${row.daysUntilExpiry} days`, accent: urgent ? "text-destructive" : soon ? "text-warning" : "text-success" },
  ];

  const relatedAlerts = mockComplianceAlerts.filter((a) => a.client === row.client);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials={initials} size="m" />
          <div className="flex-1 min-w-0">
            <p className="type-subtitle-1 text-foreground leading-tight">{row.client}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag text={`${row.riskRating} Risk`} variant={row.riskRating === "High" ? "red" : row.riskRating === "Medium" ? "yellow" : "green"} size="small" />
              <StatusTag type={row.kycStatus} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <BellSimpleIcon size={20} />,   label: "Remind" },
            { icon: <UploadSimpleIcon size={20} />, label: "Upload" },
            { icon: <CalendarPlusIcon size={20} />, label: "Schedule" },
            { icon: <SparkleIcon size={20} weight="fill" />, label: "AI Brief" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--bg-default-secondary)] border border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] transition-colors cursor-pointer"
            >
              <span className="text-primary-action">{icon}</span>
              <span className="text-[11px] font-medium text-primary-action leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 px-5 py-5 flex-1 overflow-y-auto bg-[var(--bg-default-secondary)]">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="flex flex-col justify-between gap-2 p-3 rounded-xl bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] min-h-[72px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">{kpi.label}</p>
              <div>
                {typeof kpi.value === "string"
                  ? <p className={`type-subtitle-1 font-bold leading-tight ${kpi.accent ?? "text-foreground"}`}>{kpi.value}</p>
                  : kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Expiry alert */}
        {(urgent || soon) && (
          <div className={`flex items-start gap-2.5 rounded-xl p-3.5 ${urgent ? "bg-[var(--bg-danger-light)] border border-[var(--border-danger)]" : "bg-[var(--bg-warning-light)] border border-[var(--border-warning)]"}`}>
            <ClockIcon size={13} weight="fill" className={`${urgent ? "text-[var(--text-danger-primary)]" : "text-[var(--text-warning-primary)]"} shrink-0 mt-0.5`} />
            <p className={`text-[12px] leading-relaxed ${urgent ? "text-[var(--text-danger-primary)]" : "text-[var(--text-warning-primary)]"}`}>
              {urgent ? "KYC expires in less than 7 days. Immediate action required." : `KYC expires in ${row.daysUntilExpiry} days. Schedule review soon.`}
            </p>
          </div>
        )}

        {/* Related compliance alerts */}
        {relatedAlerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Compliance Alerts</p>
            <div className="flex flex-col gap-0.5">
              {relatedAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)]">
                  <WarningCircleIcon size={14} weight="fill" className={`${a.type === "critical" ? "text-destructive" : "text-warning"} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground leading-tight">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-8">

      <KpiBar />

      <div className="flex flex-col lg:grid lg:[grid-template-columns:1fr_340px] gap-7 lg:gap-[28px] lg:items-start">
        {/* Main — min-w-0 prevents table from overflowing grid column */}
        <div className="flex flex-col gap-10 min-w-0 overflow-hidden">
          <AlertCards />
          <KycTable />
        </div>

        {/* Dark sidebar */}
        <AiGuide />
      </div>

    </div>
  );
}
