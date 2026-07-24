"use client";

import { type ReactNode, use, useState, useEffect, useRef } from "react";
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
  List,
  ListItem,
  TabGroup,
  Modal,
} from "@sarunyu/system-one";
import { ClientAssetSidebarContent } from "@/components/ClientAssetSidebarContent";
import {
  PhoneIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  SparkleIcon,
  FileTextIcon,
  ArrowsClockwiseIcon,
  ArrowsLeftRightIcon,
  PresentationChartIcon,
  CalendarCheckIcon,
  PencilSimpleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  EnvelopeSimpleIcon,
  ChatCircleIcon,
  MapPinIcon,
  CakeIcon,
  UsersThreeIcon,
  IdentificationCardIcon,
  ShieldCheckIcon,
  HourglassIcon,
  CheckCircleIcon,
  ClockIcon,
  WarningIcon,
  AlarmIcon,
  FilesIcon,
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails } from "@/lib/mock-data";
import { useClients, useNBAActions } from "@/hooks/use-api";
import { useSetHeaderSlot } from "../../header-slot-context";
import { NineBoxCellPill } from "../../client-hub/NineBoxTab";
import { getCallLogs, relativeCallDate, type CallLogEntry } from "@/data/call-log-data";
import { getClientProfile } from "@/data/client-profiles";
import { LiabilitiesDetailModal } from "@/components/LiabilitiesDetailModal";
import type { LiabilitiesDetail } from "@/data/liabilities-details";

const clientDetailById = Object.fromEntries(
  mockClients.map((c) => [c.id, mockClientDetails[c.id]])
);

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOCATION_COLORS = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#06b6d4','#6366f1','#f97316','#ec4899'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function lastContactFromCallLogs(logs: CallLogEntry[]): string {
  if (logs.length === 0) return "No contact";
  const MONTHS: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parsed = logs
    .map((log) => {
      const [d, m, y] = log.date.split(" ");
      return new Date(Number(y), MONTHS[m] ?? 0, Number(d));
    })
    .filter((d) => !isNaN(d.getTime()));
  if (parsed.length === 0) return "No contact";
  const latest = new Date(Math.max(...parsed.map((d) => d.getTime())));
  const now = new Date();
  const days = Math.floor((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

type SortDir = "none" | "asc" | "desc";

// ─── Sub-components ───────────────────────────────────────────────────────────

function CurrentAllocationSection({ slices }: { slices: { label: string; percent: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden">
        {slices.map((s, i) => (
          <div key={s.label} style={{ width: `${s.percent}%`, backgroundColor: ALLOCATION_COLORS[i] }} />
        ))}
      </div>
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {slices.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-xl p-3 bg-[var(--bg-default-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ALLOCATION_COLORS[i] }} />
              <p className="text-[11px] font-semibold text-muted-foreground truncate">{s.label}</p>
            </div>
            <p className="type-subtitle-1 font-bold leading-none text-foreground">{s.percent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopHoldingsSection({
  holdings,
  sortKey,
  sortDir,
  onSort,
}: {
  holdings: { asset: string; value: string; pnl: string; pnlPct: string; pct: string; positive: boolean }[];
  sortKey: "value" | "pnlPct" | "pct" | null;
  sortDir: SortDir;
  onSort: (key: "value" | "pnlPct" | "pct", dir: SortDir) => void;
}) {
  const parseVal = (s: string) => parseFloat(s.replace(/[฿%+,M\s]/g, "")) || 0;
  const sorted = [...holdings].sort((a, b) => {
    if (!sortKey || sortDir === "none") return 0;
    const field = sortKey === "value" ? "value" : sortKey === "pnlPct" ? "pnlPct" : "pct";
    const diff = parseVal(a[field]) - parseVal(b[field]);
    return sortDir === "asc" ? diff : -diff;
  });
  return (
    <Table>
      <colgroup>
        <col />
        <col style={{ width: "1px" }} />
        <col style={{ width: "1px" }} />
        <col style={{ width: "1px" }} />
      </colgroup>
      <TableHead>
        <TableRow>
          <TableHeaderCell sortable={false} className="min-w-0 max-w-[160px]">Asset</TableHeaderCell>
          <TableHeaderCell
            className="min-w-0 whitespace-nowrap"
            sortDirection={sortKey === "value" ? sortDir : "none"}
            onSortChange={(d) => onSort("value", d)}
          >Market Value</TableHeaderCell>
          <TableHeaderCell
            className="min-w-0 whitespace-nowrap"
            sortDirection={sortKey === "pnlPct" ? sortDir : "none"}
            onSortChange={(d) => onSort("pnlPct", d)}
          >Unrealized P&L</TableHeaderCell>
          <TableHeaderCell
            className="min-w-0 whitespace-nowrap"
            sortDirection={sortKey === "pct" ? sortDir : "none"}
            onSortChange={(d) => onSort("pct", d)}
          >% Portfolio</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((h) => (
          <TableRow key={h.asset}>
            <TableCell className="min-w-0 max-w-[160px]"><span className="type-body-2 text-foreground font-medium truncate block">{h.asset}</span></TableCell>
            <TableCell className="min-w-0 whitespace-nowrap"><span className="type-body-2 text-foreground">{h.value}</span></TableCell>
            <TableCell className="min-w-0 whitespace-nowrap">
              <div className="flex flex-col">
                <span className={`type-body-2 font-medium ${h.positive ? "text-success" : "text-destructive"}`}>{h.pnl}</span>
                <span className={`type-caption ${h.positive ? "text-success" : "text-destructive"}`}>{h.pnlPct}</span>
              </div>
            </TableCell>
            <TableCell className="min-w-0 whitespace-nowrap"><span className="type-body-2 text-foreground">{h.pct}</span></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CallLogModal({
  open,
  client,
  callLogs,
  onClose,
}: {
  open: boolean;
  client: { name: string };
  callLogs: CallLogEntry[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Modal
        variant="content"
        actionLayout="none"
        title={`Call log — ${client.name}`}
        onClose={onClose}
      >
        <div className="flex flex-col gap-3 min-w-[420px] max-w-[520px]">
          {callLogs.map((log: CallLogEntry) => (
            <div key={log.id} className="flex gap-3 p-3 rounded-xl bg-[var(--bg-default-secondary)] border border-[rgba(0,0,0,0.07)]">
              <div className="shrink-0 mt-0.5">
                {log.direction === "outbound" ? (
                  <PhoneOutgoingIcon size={18} className="text-[var(--text-brand-primary)]" />
                ) : (
                  <PhoneIncomingIcon size={18} className="text-[var(--icon-success)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="type-caption font-semibold text-foreground">{log.date} · {log.time}</span>
                  <span className="type-caption font-medium text-[var(--text-brand-primary)] shrink-0">{relativeCallDate(log.date)}</span>
                </div>
                <p className="type-caption text-foreground leading-relaxed">{log.summary}</p>
                <p className="type-caption text-muted-foreground mt-1">{log.duration}</p>
              </div>
            </div>
          ))}
          {callLogs.length === 0 && (
            <p className="type-body-2 text-muted-foreground text-center py-6">No call history yet.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

function EmptyTabState({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-24 pb-16 text-center">
      {icon}
      <p className="type-subtitle-1 font-semibold text-[var(--text-default-secondary)]">{title}</p>
      <p className="type-body-2 text-[var(--text-default-tertiary)] max-w-xs">{body}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clients = useClients();
  const nbaActions = useNBAActions(clients);

  const client = clients.find((c) => c.id === id) ?? clients[0] ?? mockClients[0];
  const detail = clientDetailById[client.id] ?? mockClientDetails["1"];

  // Page tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Task state (interactive checkboxes)
  const [tasks, setTasks] = useState(detail.tasks);

  // Holdings sort state
  const [holdingsSortDir, setHoldingsSortDir] = useState<SortDir>("none");
  const [holdingsSortKey, setHoldingsSortKey] = useState<
    "value" | "pnlPct" | "pct" | null
  >(null);

  // Nine Box cell for this client

  // NBA action for this client (provides aiDraft + revenueImpact for AI cards)
  const nbaAction = nbaActions.find((a) => a.clientId === client.id);
  const [callLogOpen, setCallLogOpen] = useState(false);
  const callLogs = getCallLogs(client.id);
  const profile = getClientProfile(client.id);
  const [liabilitiesOpen, setLiabilitiesOpen] = useState(false);
  const [liabilitiesData, setLiabilitiesData] = useState<{ amount: string; detail: LiabilitiesDetail } | null>(null);

  const setHeaderSlot = useSetHeaderSlot();

  // Compact sticky header on scroll
  const [scrolled, setScrolled] = useState(false);
  const collapsedRef = useRef(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      const top = main.scrollTop;
      const remaining = main.scrollHeight - main.clientHeight - top;
      if (!collapsedRef.current && top > 50 && remaining > 100) {
        collapsedRef.current = true;
        setScrolled(true);
      } else if (collapsedRef.current && top <= 8) {
        collapsedRef.current = false;
        setScrolled(false);
      }
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  // Reset header + scroll position on tab change
  useEffect(() => {
    collapsedRef.current = false;
    setScrolled(false);
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    setHeaderSlot(null);
    return () => setHeaderSlot(null);
  }, [scrolled, activeTab, setHeaderSlot]);

  return (
    <div className="flex flex-col -mt-6">
      {/* Sticky Identity + KPI bar + Tabs */}
      <div className="sticky -top-6 z-20 -mx-[9999px] px-[9999px] bg-card">
        <div className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-4 lg:gap-8 transition-[padding] duration-300 ease-out ${scrolled ? "py-3" : "py-5"}`}>

          {/* Left: identity + actions */}
          <div className={`flex flex-col ${scrolled ? "justify-center" : "gap-4"}`}>

            {/* Avatar + identity + actions (actions move inline when scrolled on desktop) */}
            <div className={`flex flex-col ${scrolled ? "gap-2 lg:flex-row lg:items-center lg:gap-4" : "gap-4"}`}>

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
                    <NineBoxCellPill client={client} />
                  </div>
                  {/* Metadata — collapses when scrolled */}
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
                    <div className="overflow-hidden min-h-0">
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="type-caption text-muted-foreground">{client.id}</span>
                        <span className="type-caption text-muted-foreground/40">·</span>
                        <span className="type-caption text-muted-foreground">Last Contact: {lastContactFromCallLogs(callLogs)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" leftIcon={<PhoneIcon size={16} />} onClick={() => setCallLogOpen(true)}>Call log</Button>
                <Button variant="outline" size="sm" leftIcon={<PencilSimpleIcon size={16} />}>Notes</Button>
                <Button variant="outline" size="sm" leftIcon={<CalendarCheckIcon size={16} />}>Reminder</Button>
              </div>

            </div>

            {/* Quick contact — collapses on scroll */}
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
              <div className="overflow-hidden min-h-0">
                <div className="flex items-center gap-4 pt-1">
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <PhoneIcon size={13} />
                    <span className="type-caption">{profile.phone}</span>
                  </a>
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <EnvelopeSimpleIcon size={13} />
                    <span className="type-caption">{profile.email}</span>
                  </a>
                  {profile.lineId && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <ChatCircleIcon size={13} />
                      <span className="type-caption">{profile.lineId}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: KPIs — fade between sizes, hide on mobile when scrolled */}
          <div className={`flex items-center shrink-0 w-full md:w-auto ${scrolled ? "hidden sm:flex" : ""}`}>
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

        {/* ── Tab navigation ── */}
        <div className="transparent-tabs scrollable-tabs -mx-4 xl:-mx-6 pl-4 xl:pl-6">
          <TabGroup
            items={[
              { id: "overview", title: "Overview" },
              { id: "kyc", title: "KYC" },
              { id: "assets", title: "Assets" },
              { id: "notes", title: "Notes" },
              { id: "reminder", title: "Reminder" },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
            size="md"
          />
        </div>
      </div>

      {/* ── Body content ── */}
      {activeTab === "kyc" ? (
        <div className="pt-10 max-w-3xl mx-auto w-full">

          {/* ── Single profile card ── */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">

            {/* Stat tiles row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-blue-100 divide-x divide-y divide-blue-100 sm:divide-y-0 bg-blue-50">
              {[
                { icon: <CurrencyCircleDollarIcon size={22} weight="fill" className="text-[var(--text-brand-primary)]" />, label: "Total AUM", value: client.aum },
                { icon: <IdentificationCardIcon size={22} weight="fill" className="text-[var(--text-brand-primary)]" />, label: "Client ID", value: client.id },
                { icon: <CalendarCheckIcon size={22} weight="fill" className="text-[var(--text-brand-primary)]" />, label: "Account Opened", value: profile.relationshipSince },
                { icon: <ShieldCheckIcon size={22} weight="fill" className="text-[var(--text-brand-primary)]" />, label: "Risk Profile", value: profile.riskProfile },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-3 sm:px-5 py-4">
                  <div className="flex items-center justify-center shrink-0">{icon}</div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="type-body-2 !font-semibold text-foreground truncate">{value}</p>
                    <p className="type-caption text-[var(--text-brand-primary)]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border border-t border-border">

              {/* Personal */}
              <div className="p-6 flex flex-col gap-4">
                <p className="type-caption font-bold text-muted-foreground uppercase tracking-widest">Personal</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <CakeIcon size={16} weight="fill" />, label: "Birthday", value: profile.birthday },
                    { icon: <HourglassIcon size={16} weight="fill" />, label: "Age", value: `${profile.age} years old` },
                    { icon: <UsersThreeIcon size={16} weight="fill" />, label: "Nationality", value: profile.nationality },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl bg-[var(--bg-default-secondary)] px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        {icon}
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p className="type-caption text-muted-foreground">{label}</p>
                        <p className="type-body-2 !font-semibold text-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 flex flex-col gap-4">
                <p className="type-caption font-bold text-muted-foreground uppercase tracking-widest">Contact</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <PhoneIcon size={16} weight="fill" />, label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
                    { icon: <EnvelopeSimpleIcon size={16} weight="fill" />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
                    ...(profile.lineId ? [{ icon: <ChatCircleIcon size={16} weight="fill" />, label: "LINE", value: profile.lineId, href: undefined }] : []),
                    { icon: <MapPinIcon size={16} weight="fill" />, label: "Address", value: profile.address, href: undefined },
                  ].map(({ icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3 rounded-xl bg-[var(--bg-default-secondary)] px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p className="type-caption text-muted-foreground">{label}</p>
                        {href ? (
                          <a href={href} className="type-body-2 !font-semibold text-foreground hover:text-primary-action transition-colors truncate">{value}</a>
                        ) : (
                          <p className="type-body-2 !font-semibold text-foreground leading-snug">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </div>

          </div>

          {/* ── Important Forms ── */}
          <div className="pt-6 pb-2 max-w-3xl mx-auto w-full">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border">
                <p className="type-subtitle-2 font-bold text-foreground">Important Forms</p>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "Wealth Declaration", description: "แบบแจ้งการเป็นผู้ลงทุนรายใหญ่ / รายใหญ่พิเศษ / ที่มีลักษณะเฉพาะ", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "done" as const },
                  { title: "FATCA and CRS", description: "แบบแจ้งความเป็นบุคคลอเมริกัน และผู้มีถิ่นที่อยู่ทางภาษีในประเทศอื่น", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "pending" as const },
                  { title: "W-8Ben", description: "แบบฟอร์มภาษีของกรมสรรพากรแห่งสหรัฐอเมริกา", date: "อัปเดตล่าสุด: 24 Jul 2024", status: null },
                  { title: "แบบประเมินความรู้ความสามารถในการลงทุน (Knowledge Assessment)", description: "สำหรับการลงทุนในผลิตภัณฑ์ในตลาดทุนที่มีความเสี่ยงสูงหรือมีความซับซ้อน", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "not-done" as const },
                  { title: "แบบทดสอบความรู้ผู้ลงทุน เกี่ยวกับตราสารหนี้", description: "สำหรับการจองซื้อ/ซื้อขายตราสารหนี้ (Perpetual Bond)", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "not-done" as const },
                  { title: "แบบประเมินความเหมาะสมในการลงทุน (Suitability Test)", description: "ประเมินระดับความสามารถในการรับความเสี่ยงจากการลงทุน เพื่อหาประเภทหลักทรัพย์ที่เหมาะสม", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "oncoming" as const },
                ].map(({ title, description, date, status }) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
                    <FilesIcon size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col flex-1 min-w-0 gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="type-body-2 font-bold text-foreground leading-snug">{title}</p>
                        {status === "done"     && <CheckCircleIcon size={18} weight="fill" className="text-green-500 shrink-0 mt-0.5" />}
                        {status === "pending"  && <ClockIcon       size={18} weight="regular" className="text-muted-foreground shrink-0 mt-0.5" />}
                        {status === "not-done" && <WarningIcon     size={18} weight="fill" className="text-orange-500 shrink-0 mt-0.5" />}
                        {status === "oncoming" && <AlarmIcon       size={18} weight="fill" className="text-blue-500 shrink-0 mt-0.5" />}
                      </div>
                      <p className="type-caption text-muted-foreground leading-snug line-clamp-2">{description}</p>
                      <p className="type-caption text-muted-foreground/60">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : activeTab === "assets" ? (
        <div className="pt-8">
          <ClientAssetSidebarContent
            clientId={client.id}
            client={client}
            accordionCards
            onLiabilitiesOpen={(amount, detail) => {
              setLiabilitiesData({ amount, detail });
              setLiabilitiesOpen(true);
            }}
          />
        </div>
      ) : activeTab === "notes" ? (
        <EmptyTabState
          icon={<FileTextIcon size={40} className="text-[var(--text-default-placeholder)]" />}
          title="No notes yet"
          body="Notes for this client will appear here."
        />
      ) : activeTab === "reminder" ? (
        <EmptyTabState
          icon={<AlarmIcon size={40} className="text-[var(--text-default-placeholder)]" />}
          title="No reminders yet"
          body="Reminders for this client will appear here."
        />
      ) : (
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
                onSort={(key, dir) => {
                  setHoldingsSortKey(dir === "none" ? null : key);
                  setHoldingsSortDir(dir);
                }}
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
      )}{/* end tab content */}

      <CallLogModal
        open={callLogOpen}
        client={client}
        callLogs={callLogs}
        onClose={() => setCallLogOpen(false)}
      />

      {liabilitiesData && (
        <LiabilitiesDetailModal
          open={liabilitiesOpen}
          totalAmount={liabilitiesData.amount}
          detail={liabilitiesData.detail}
          onClose={() => setLiabilitiesOpen(false)}
        />
      )}
    </div>
  );
}
