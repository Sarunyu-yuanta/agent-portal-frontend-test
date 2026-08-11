"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TabGroup,
  Button,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Pagination,
  SearchInput,
  Tooltip,
  Modal,
  BottomSheet,
} from "@sarunyu/system-one";
import {
  PhoneListIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  UserIcon,
  UsersIcon,
  NotePencilIcon,
  BellSimpleIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  InfoIcon,
  SlidersHorizontalIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { getCallLogs, relativeCallDate, type CallLogEntry } from "@/data/call-log-data";
import { mockClients, mockClientDetails, mockKYCData } from "@/lib/mock-data";
import { ALLOCATION_SLICES } from "@/components/AssetSummarySection";
import { useClients } from "@/hooks/use-api";
import { usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StatCardRow } from "@/components/ui/finance-ui";
import { AssetSummarySection, type AssetHeroSummary } from "@/components/AssetSummarySection";
import { ClientAssetSidebarContent, type AssetListViewMode } from "@/components/ClientAssetSidebarContent";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import { LiabilitiesDetailContent } from "@/components/LiabilitiesDetailModal";
import type { LiabilitiesDetail } from "@/data/liabilities-details";
import { NineBoxTab, NINE_BOX_HEAT_STYLES, getNineBoxCell, NineBoxCellPill, type NineBoxCellInfo } from "./NineBoxTab";
import {
  getAssetAccountDetail,
  getAssetProductDetail,
  type AssetAccountItem,
} from "@/data/asset-account-details";
import {
  LINE_AVAILABLE_RATIO,
  LIABILITIES_MULTIPLIER,
  parseAumToThb,
  parsePlYtdPct,
  formatThbAmount,
  formatThaiUpdatedAt,
} from "@/lib/client-utils";
import { PRODUCT_SUB_DATA, type SubProduct } from "@/data/product-sub-data";

type Client = (typeof mockClients)[number];

// ─── Product view types ───────────────────────────────────────────────────────

type ProductHolder = {
  clientId: string;
  clientName: string;
  tier: string;
  allocationPct: number;
  amountThb: number;
};

type ProductRow = {
  label: string;
  statusIcon: string;
  clientCount: number;
  totalAmountThb: number;
  avgAllocationPct: number;
  holders: ProductHolder[];
};

type ViewFilter = "customer" | "product" | "nine-box";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildHeroSummaryFromClients(clients: Client[]): AssetHeroSummary {
  const updatedAt = formatThaiUpdatedAt(new Date());

  if (clients.length === 0) {
    return {
      netValue: "0.00",
      changeAmount: "+0.00",
      changePercent: "0.00",
      changePositive: true,
      lineAvailable: "0.00",
      cash: "0.00",
      lastUpdatedDate: updatedAt.date,
      lastUpdatedTime: updatedAt.time,
    };
  }

  let netValue = 0;
  let cash = 0;
  let lineAvailable = 0;
  let plChange = 0;

  for (const client of clients) {
    const aumThb = parseAumToThb(client.aum);
    netValue += aumThb;
    cash += aumThb * (client.cashIdlePct / 100);
    lineAvailable += aumThb * LINE_AVAILABLE_RATIO;

    const pct = parsePlYtdPct(client.plYtd);
    const sign = client.plPositive ? 1 : -1;
    plChange += aumThb * (pct / 100) * sign;
  }

  const changePercent = netValue > 0 ? (plChange / netValue) * 100 : 0;

  return {
    netValue: formatThbAmount(netValue),
    changeAmount: formatThbAmount(plChange, true),
    changePercent: Math.abs(changePercent).toFixed(2),
    changePositive: plChange >= 0,
    lineAvailable: formatThbAmount(lineAvailable),
    cash: formatThbAmount(cash),
    lastUpdatedDate: updatedAt.date,
    lastUpdatedTime: updatedAt.time,
  };
}

// ─── Client Summary Cards ─────────────────────────────────────────────────────

function formatMillionThb(thb: number): string {
  const m = thb / 1_000_000;
  return `฿ ${m.toLocaleString("en-US", { maximumFractionDigits: 0 })}M`;
}

const SEGMENT_COLORS: Record<string, string> = {
  UHNW: "#3b82f6",
  HNW: "#94a3b8",
  Affluent: "#f59e0b",
};

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return {
    open,
    setOpen,
    ref,
    hoverProps: {
      onMouseEnter: () => { clearTimeout(timer.current); setOpen(true); },
      onMouseLeave: () => { timer.current = setTimeout(() => setOpen(false), 120); },
    },
  };
}

function PopoverChevron({ open }: { open: boolean }) {
  return (
    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${open ? "bg-primary-action text-white" : "bg-muted text-muted-foreground"}`}>
      <InfoIcon size={12} weight="bold" />
    </div>
  );
}

function CardShell({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full h-full text-left flex flex-col gap-2 p-4 rounded-2xl bg-white border transition-colors cursor-pointer ${open ? "border-primary-action" : "border-border hover:border-primary-action/40"}`}
    >
      {children}
    </button>
  );
}

function StaticCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-border">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[24px] font-bold text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function PopoverList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-border rounded-xl shadow-xl overflow-hidden min-w-[260px]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1">{title}</p>
      {children}
    </div>
  );
}

function ClientListRow({ rank, name, sub, right }: { rank?: number; name: string; sub: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border">
      {rank !== undefined && <span className="text-[12px] text-muted-foreground w-4 text-right shrink-0">{rank}</span>}
      <Avatar type="text" initials={getInitials(name)} size="xs" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      {right}
    </div>
  );
}

function ClientSummaryCards({ clients }: { clients: Client[] }) {
  const { isPrivate } = usePrivacy();
  const segment = usePopover();
  const asset = usePopover();
  const kyc = usePopover();

  const { totalAum, totalCash } = useMemo(() => {
    let aum = 0, cash = 0;
    for (const c of clients) {
      const a = parseAumToThb(c.aum);
      aum += a;
      cash += a * (c.cashIdlePct / 100);
    }
    return { totalAum: aum, totalCash: cash };
  }, [clients]);

  const segmentBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of clients) counts.set(c.tier, (counts.get(c.tier) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [clients]);

  const kycDueClients = useMemo(() =>
    mockKYCData
      .filter((k) => k.daysUntilExpiry < 30)
      .flatMap((k) => {
        const client = clients.find((c) => c.id === k.clientId);
        return client ? [{ ...k, client }] : [];
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    [clients]
  );

  const topClients = useMemo(
    () => [...clients].sort((a, b) => parseAumToThb(b.aum) - parseAumToThb(a.aum)),
    [clients]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Clients */}
      <div ref={segment.ref} className="relative min-w-0" {...segment.hoverProps}>
        <CardShell open={segment.open} onClick={() => segment.setOpen((p) => !p)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Clients</p>
            <PopoverChevron open={segment.open} />
          </div>
          <p className="text-[24px] font-bold text-foreground leading-none">{clients.length}</p>
          <p className="text-[11px] text-muted-foreground">ราย</p>
        </CardShell>
        {segment.open && clients.length > 0 && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">สัดส่วนตาม Segment</p>
            <div className="flex h-2 rounded-full overflow-hidden mb-3">
              {segmentBreakdown.map(([tier, count]) => (
                <div key={tier} style={{ width: `${(count / clients.length) * 100}%`, backgroundColor: SEGMENT_COLORS[tier] ?? "#94a3b8" }} />
              ))}
            </div>
            {segmentBreakdown.map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between gap-6 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEGMENT_COLORS[tier] ?? "#94a3b8" }} />
                  <span className="text-[13px] text-foreground">{tier}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-foreground">{count}</span>
                  <span className="text-[11px] text-muted-foreground">({Math.round((count / clients.length) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Wealth Under Advice */}
      <StaticCard label="Wealth Under Advice" value={formatMillionThb(totalAum)} sub="AUM รวมทั้งหมด" />

      {/* 3. มูลค่าทรัพย์สิน */}
      <div ref={asset.ref} className="relative min-w-0" {...asset.hoverProps}>
        <CardShell open={asset.open} onClick={() => asset.setOpen((p) => !p)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">มูลค่าทรัพย์สิน</p>
            <PopoverChevron open={asset.open} />
          </div>
          <p className="text-[24px] font-bold text-foreground leading-none">{formatMillionThb(totalAum - totalCash)}</p>
          <p className="text-[11px] text-muted-foreground">ไม่รวม cash</p>
        </CardShell>
        {asset.open && (
          <PopoverList title="ลูกค้าเรียงตามมูลค่าทรัพย์สิน">
            {topClients.map((c, i) => {
              const name = maskName(c.name, isPrivate);
              return (
                <ClientListRow
                  key={c.id}
                  rank={i + 1}
                  name={name}
                  sub={c.tier}
                  right={<span className="text-[12px] font-bold text-foreground shrink-0">{c.aum}</span>}
                />
              );
            })}
          </PopoverList>
        )}
      </div>

      {/* 4. KYC ครบกำหนด */}
      <div ref={kyc.ref} className="relative min-w-0" {...kyc.hoverProps}>
        <CardShell open={kyc.open} onClick={() => kyc.setOpen((p) => !p)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">KYC ครบกำหนด</p>
            <PopoverChevron open={kyc.open} />
          </div>
          <p className={`text-[24px] font-bold leading-none ${kycDueClients.length > 0 ? "text-[var(--text-warning-primary)]" : "text-foreground"}`}>
            {kycDueClients.length}
          </p>
          <p className="text-[11px] text-muted-foreground">ภายใน 30 วัน</p>
        </CardShell>
        {kyc.open && (
          <PopoverList title="ลูกค้าที่ KYC ใกล้หมดอายุ">
            {kycDueClients.length === 0
              ? <p className="text-[13px] text-muted-foreground px-4 py-3">ไม่มีลูกค้าที่ KYC ใกล้ครบกำหนด</p>
              : kycDueClients.map((k) => {
                  const name = maskName(k.client.name, isPrivate);
                  return (
                    <ClientListRow
                      key={k.id}
                      name={name}
                      sub={`${k.client.tier} · ${k.nextReview}`}
                      right={
                        <span className={`text-[12px] font-bold shrink-0 ${k.daysUntilExpiry <= 7 ? "text-[var(--text-danger-primary)]" : "text-[var(--text-warning-primary)]"}`}>
                          {k.daysUntilExpiry}d
                        </span>
                      }
                    />
                  );
                })
            }
          </PopoverList>
        )}
      </div>

      {/* 5. Cash Under Advice */}
      <StaticCard label="Cash Under Advice" value={formatMillionThb(totalCash)} sub="เงินรอลงทุน" />
    </div>
  );
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────

function ClientDetailPanel({
  client,
  onViewFull,
  onBack,
}: {
  client: Client;
  onViewFull: () => void;
  onBack?: () => void;
}) {
  const { isPrivate } = usePrivacy();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetAccountItem | null>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<AssetListViewMode>("product");
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [liabilitiesMounted, setLiabilitiesMounted] = useState(false);
  const [liabilitiesVisible, setLiabilitiesVisible] = useState(false);
  const [liabilitiesData, setLiabilitiesData] = useState<{ amount: string; detail: LiabilitiesDetail } | null>(null);
  const [callLogOpen, setCallLogOpen] = useState(false);
  const callLogs = getCallLogs(client.id);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setCompact(false);
    setDetailVisible(false);
    setDetailMounted(false);
    setSelectedItem(null);
    setLiabilitiesVisible(false);
    setLiabilitiesMounted(false);
    setLiabilitiesData(null);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [client.id]);

  const handleItemClick = (item: AssetAccountItem, viewMode: AssetListViewMode) => {
    setSelectedItem(item);
    setSelectedViewMode(viewMode);
    setDetailMounted(true);
    requestAnimationFrame(() => setDetailVisible(true));
  };

  const handleBack = () => {
    setDetailVisible(false);
    setTimeout(() => {
      setDetailMounted(false);
      setSelectedItem(null);
    }, 300);
  };

  const handleLiabilitiesOpen = (amount: string, detail: LiabilitiesDetail) => {
    setLiabilitiesData({ amount, detail });
    setLiabilitiesMounted(true);
    requestAnimationFrame(() => setLiabilitiesVisible(true));
  };

  const handleLiabilitiesBack = () => {
    setLiabilitiesVisible(false);
    setTimeout(() => {
      setLiabilitiesMounted(false);
      setLiabilitiesData(null);
    }, 300);
  };

  const holdingDetail = selectedItem
    ? selectedViewMode === "account"
      ? getAssetAccountDetail(selectedItem.accountNo)
      : getAssetProductDetail(selectedItem.name)
    : null;

  const detailTitle = holdingDetail?.viewByLabel.replace(/^view by /i, "") ?? "";

  const handleScroll = useCallback(() => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setCompact((prev) => {
      if (prev && top <= 4) return false;
      if (!prev && top > 12) return true;
      return prev;
    });
  }, []);

  return (
    <>
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        className={`flex flex-col shrink-0 border-b border-[var(--border-default)] transition-[padding,gap] duration-300 ease-out ${
          compact ? "px-5 py-3 gap-0" : "px-5 pt-5 pb-4 gap-4"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
          )}
          <Avatar
            type="text"
            initials={getInitials(maskName(client.name, isPrivate))}
            size={compact ? "s" : "m"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-foreground leading-tight transition-all duration-300 ${
                  compact ? "type-subtitle-2 font-bold" : "type-subtitle-1"
                }`}
              >
                {maskName(client.name, isPrivate)}
              </p>
              {!compact && <NineBoxCellPill client={client} />}
            </div>
            <p className="type-caption text-muted-foreground">{client.id}</p>
          </div>
          {compact ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 mr-8 whitespace-nowrap"
              leftIcon={<UserIcon size={14} />}
              onClick={onViewFull}
            >
              View Full Profile
            </Button>
          ) : (
            <div className="w-10 shrink-0" />
          )}
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <PhoneListIcon size={20} />,   label: "Call log", onClick: () => setCallLogOpen(true), comingSoon: false },
                { icon: <NotePencilIcon size={20} />,  label: "Notes",    onClick: () => {},                  comingSoon: true  },
                { icon: <BellSimpleIcon size={20} />,  label: "Reminder", onClick: () => {},                  comingSoon: true  },
              ].map(({ icon, label, onClick, comingSoon }) => (
                <button
                  key={label}
                  onClick={comingSoon ? undefined : onClick}
                  disabled={comingSoon}
                  className={`relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-colors overflow-hidden ${
                    comingSoon
                      ? "bg-[var(--bg-default-secondary)] border-[var(--border-default)]/40 cursor-not-allowed"
                      : "bg-[var(--bg-default-secondary)] border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] cursor-pointer"
                  }`}
                >
                  <span className={`text-primary-action ${comingSoon ? "opacity-15" : ""}`}>{icon}</span>
                  <span className={`text-[11px] font-medium text-primary-action leading-none ${comingSoon ? "opacity-15" : ""}`}>
                    {label}
                  </span>
                  {comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-primary-action bg-[var(--bg-brand-light)] border border-primary-action/30 px-1.5 py-0.5 rounded-full">Coming soon</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              leftIcon={<UserIcon size={16} />}
              onClick={onViewFull}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto hide-scrollbar"
      >
        <ClientAssetSidebarContent
          clientId={client.id}
          client={client}
          onItemClick={handleItemClick}
          onLiabilitiesOpen={handleLiabilitiesOpen}
        />
      </div>

      {/* Detail view — covers entire panel including sticky header */}
      {detailMounted && holdingDetail && (
        <div
          className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
            detailVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] flex-1 min-w-0 truncate">
              {detailTitle}
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            <HoldingDetailContent detail={holdingDetail} />
          </div>
        </div>
      )}

      {/* Liabilities view — same slide-in pattern */}
      {liabilitiesMounted && liabilitiesData && (
        <div
          className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
            liabilitiesVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
            <button
              type="button"
              onClick={handleLiabilitiesBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] flex-1 min-w-0 truncate">
              Liabilities
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            <div className="flex flex-col gap-4 p-4">
              <LiabilitiesDetailContent
                totalAmount={liabilitiesData.amount}
                detail={liabilitiesData.detail}
              />
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Call log — BottomSheet on mobile, Modal on tablet/desktop */}
    {isMobile ? (
      <BottomSheet
        open={callLogOpen}
        onOpenChange={setCallLogOpen}
        title={`Call log — ${client.name}`}
        showHandle
        showHeader
        rightSide="none"
        contentClassName="flex flex-col gap-3 p-4"
      >
        {callLogs.map((log: CallLogEntry) => (
          <div key={log.id} className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="type-body-2 text-foreground font-semibold">{log.date} · {log.time}</span>
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                {log.direction === "outbound" ? (
                  <PhoneOutgoingIcon size={14} className="text-[var(--text-brand-primary)]" />
                ) : (
                  <PhoneIncomingIcon size={14} className="text-[var(--icon-success)]" />
                )}
                <span className="type-caption">{log.direction === "outbound" ? "Outbound" : "Inbound"}</span>
              </div>
            </div>
            <p className="type-caption text-muted-foreground">{relativeCallDate(log.date)} · {log.duration}</p>
            <p className="type-body-2 text-foreground mt-1">{log.summary}</p>
          </div>
        ))}
        {callLogs.length === 0 && (
          <p className="type-body-2 text-muted-foreground text-center py-6">No call history yet.</p>
        )}
      </BottomSheet>
    ) : (
      callLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Modal
            variant="content"
            actionLayout="none"
            title={`Call log — ${client.name}`}
            onClose={() => setCallLogOpen(false)}
          >
            <div className="flex flex-col gap-3 min-w-[420px] max-w-[520px]">
              {callLogs.map((log: CallLogEntry) => (
                <div key={log.id} className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="type-body-2 text-foreground font-semibold">{log.date} · {log.time}</span>
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      {log.direction === "outbound" ? (
                        <PhoneOutgoingIcon size={14} className="text-[var(--text-brand-primary)]" />
                      ) : (
                        <PhoneIncomingIcon size={14} className="text-[var(--icon-success)]" />
                      )}
                      <span className="type-caption">{log.direction === "outbound" ? "Outbound" : "Inbound"}</span>
                    </div>
                  </div>
                  <p className="type-caption text-muted-foreground">{relativeCallDate(log.date)} · {log.duration}</p>
                  <p className="type-body-2 text-foreground mt-1">{log.summary}</p>
                </div>
              ))}
              {callLogs.length === 0 && (
                <p className="type-body-2 text-muted-foreground text-center py-6">No call history yet.</p>
              )}
            </div>
          </Modal>
        </div>
      )
    )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortDir = "none" | "asc" | "desc";
type SortKey =
  | "rowIndex"
  | "id"
  | "name"
  | "aum"
  | "thaiStock"
  | "foreignStock"
  | "derivatives"
  | "mutualFund"
  | "bond"
  | "foreignBond"
  | "structuredBond"
  | "plYtd"
  | "liabilities"
  | "cashIdle"
  | "nineBox"
  | null;

function getClientSliceAmount(c: Client, label: string): number {
  const detail = mockClientDetails[c.id];
  const slices = detail?.assetSummary?.allocationSlices?.length
    ? detail.assetSummary.allocationSlices
    : ALLOCATION_SLICES;
  const pct = slices.find((s) => s.label === label)?.percent ?? 0;
  return parseAumToThb(c.aum) * (pct / 100);
}

function getSortValue(c: Client, key: SortKey): number | string {
  switch (key) {
    case "id": return c.id;
    case "name": return c.name;
    case "aum": return parseAumToThb(c.aum);
    case "thaiStock": return getClientSliceAmount(c, "หุ้นไทย");
    case "foreignStock": return getClientSliceAmount(c, "หุ้นต่างประเทศ");
    case "derivatives": return getClientSliceAmount(c, "อนุพันธ์");
    case "mutualFund": return getClientSliceAmount(c, "กองทุนรวม");
    case "bond": return getClientSliceAmount(c, "ตราสารหนี้");
    case "foreignBond": return getClientSliceAmount(c, "ตราสารหนี้ต่างประเทศ");
    case "structuredBond": return getClientSliceAmount(c, "หุ้นกู้ที่มีอนุพันธ์แฝง");
    case "plYtd": { const m = c.plYtd.match(/([+-]?[\d.]+)/); return m ? parseFloat(m[1]) : 0; }
    case "liabilities": return parseAumToThb(c.aum) * LIABILITIES_MULTIPLIER;
    case "cashIdle": return parseAumToThb(c.aum) * (c.cashIdlePct / 100);
    case "nineBox": return getNineBoxCell(c).heat;
    default: return 0;
  }
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ─── Column visibility ─────────────────────────────────────────────────────────

type ColumnId =
  | "clientId"
  | "client"
  | "aum"
  | "thaiStock"
  | "foreignStock"
  | "derivatives"
  | "mutualFund"
  | "bond"
  | "foreignBond"
  | "structuredBond"
  | "cashIdle"
  | "plYtd"
  | "liabilities"
  | "nineBox";

const CUSTOMER_COLUMNS: { id: ColumnId; label: string; width: number }[] = [
  { id: "clientId",       label: "Client ID",                                            width: 100 },
  { id: "client",         label: "Client",                                               width: 180 },
  { id: "aum",            label: "AUM (THB)",                                            width: 150 },
  { id: "thaiStock",      label: "หุ้นไทย (บาท)",                                        width: 150 },
  { id: "foreignStock",   label: "หุ้นต่างประเทศ (บาท)",                                  width: 170 },
  { id: "derivatives",    label: "TFEX (บาท)",                                            width: 140 },
  { id: "mutualFund",     label: "กองทุนรวม (บาท)",                                       width: 150 },
  { id: "bond",           label: "ตราสารหนี้ (บาท)",                                      width: 150 },
  { id: "foreignBond",    label: "ตราสารหนี้ต่างประเทศ (บาท)",                             width: 200 },
  { id: "structuredBond", label: "หุ้นกู้ที่มีอนุพันธ์แฝง (บาท)",                           width: 210 },
  { id: "cashIdle",       label: "เงินสด (บาท)",                                          width: 140 },
  { id: "plYtd",          label: "กำไร/ขาดทุน (บาท)",                                     width: 150 },
  { id: "liabilities",    label: "Liabilities",                                          width: 140 },
  { id: "nineBox",        label: "Nine Box",                                             width: 110 },
];

export default function ClientHubPage() {
  const { isPrivate } = usePrivacy();
  const router = useRouter();
  const clients = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("customer");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [productDetailTab, setProductDetailTab] = useState<"sub" | "clients">("sub");
  const [expandedSubIds, setExpandedSubIds] = useState<Set<string>>(new Set());
  const [productPushClient, setProductPushClient] = useState<Client | null>(null);
  const [productPushMounted, setProductPushMounted] = useState(false);
  const [productPushVisible, setProductPushVisible] = useState(false);

  const [nineBoxCell, setNineBoxCell] = useState<NineBoxCellInfo | null>(null);
  const [nineBoxDrawerOpen, setNineBoxDrawerOpen] = useState(false);
  const [nineBoxPushClient, setNineBoxPushClient] = useState<Client | null>(null);
  const [nineBoxPushMounted, setNineBoxPushMounted] = useState(false);
  const [nineBoxPushVisible, setNineBoxPushVisible] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(
    () => new Set(CUSTOMER_COLUMNS.map((c) => c.id)),
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColumnMenu) return;
    function handleOutside(e: MouseEvent) {
      if (window.innerWidth < 1024) return; // tablet uses Modal, mobile uses Sheet — both handle their own closing
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showColumnMenu]);

  const toggleColumn = (id: ColumnId) =>
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const col = (id: ColumnId) => visibleColumns.has(id);

  const tableWidth = useMemo(() => {
    const NO_COL_WIDTH = 60;
    return NO_COL_WIDTH + CUSTOMER_COLUMNS.reduce(
      (sum, c) => sum + (visibleColumns.has(c.id) ? c.width : 0),
      0,
    );
  }, [visibleColumns]);

  const dirFor = (k: SortKey): SortDir => (sortKey === k ? sortDir : "none");
  const handleSort = (k: SortKey) => (next: SortDir) => {
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    let list = clients;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q) ||
          c.riskProfile.toLowerCase().includes(q),
      );
    }

    if (sortKey && sortDir !== "none") {
      const origIdx = sortKey === "rowIndex"
        ? new Map(clients.map((c, i) => [c.id, i]))
        : null;
      list = [...list].sort((a, b) => {
        const av = origIdx ? (origIdx.get(a.id) ?? 0) : getSortValue(a, sortKey);
        const bv = origIdx ? (origIdx.get(b.id) ?? 0) : getSortValue(b, sortKey);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [search, sortKey, sortDir, clients]);

  const originalIndexMap = useMemo(
    () => new Map(clients.map((c, i) => [c.id, i + 1])),
    [clients],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const heroSummary = useMemo(() => {
    const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
    return buildHeroSummaryFromClients(visible);
  }, [sorted, safePage, pageSize]);

  const productRows = useMemo((): ProductRow[] => {
    const map = new Map<string, { statusIcon: string; holders: ProductHolder[] }>();
    for (const client of clients) {
      const detail = mockClientDetails[client.id];
      const slices = detail?.assetSummary?.allocationSlices?.length
        ? detail.assetSummary.allocationSlices
        : ALLOCATION_SLICES;
      const aumThb = parseAumToThb(client.aum);
      for (const slice of slices) {
        if (slice.percent <= 0) continue;
        if (!map.has(slice.label)) map.set(slice.label, { statusIcon: slice.statusIcon, holders: [] });
        map.get(slice.label)!.holders.push({
          clientId: client.id,
          clientName: client.name,
          tier: client.tier,
          allocationPct: slice.percent,
          amountThb: aumThb * (slice.percent / 100),
        });
      }
    }
    return Array.from(map.entries())
      .map(([label, { statusIcon, holders }]) => ({
        label,
        statusIcon,
        clientCount: holders.length,
        totalAmountThb: holders.reduce((s, h) => s + h.amountThb, 0),
        avgAllocationPct: holders.reduce((s, h) => s + h.allocationPct, 0) / holders.length,
        holders: [...holders].sort((a, b) => b.amountThb - a.amountThb),
      }))
      .sort((a, b) => b.totalAmountThb - a.totalAmountThb);
  }, [clients]);

  const filteredProductRows = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return q ? productRows.filter((r) => r.label.toLowerCase().includes(q)) : productRows;
  }, [productRows, productSearch]);

  function openClient(client: Client) {
    setSelectedClient(client);
    setDrawerOpen(true);
  }

  return (
    <>
      {/* Hero — own padding + max-width */}
      <div className="pt-4 pb-2 xl:pt-6 xl:pb-2">
        <div className="max-w-[1280px] mx-auto px-4 xl:px-6 flex flex-col gap-4">
          {/* <AssetSummarySection heroSummary={heroSummary} /> */}
          <ClientSummaryCards clients={clients} />
        </div>
      </div>

      {/* White section — full-width background, content constrained to max-w */}
      <section className="flex-1 bg-white rounded-t-[16px] xl:rounded-t-2xl">
        <div className="max-w-[1280px] mx-auto px-4 xl:px-6 flex flex-col gap-3 pt-4 xl:pt-6 pb-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 min-h-10">
            <TabGroup
              items={[
                { id: "customer", title: `Customer (${sorted.length})` },
                { id: "product", title: `Product (${filteredProductRows.length})` },
              ]}
              activeId={viewFilter}
              size="md"
              onChange={(id) => setViewFilter(id as ViewFilter)}
            />
            {viewFilter === "customer" && (
              <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
                <div className="relative shrink-0" ref={columnMenuRef}>
                  <Button
                    variant="outline"
                    size="xl"
                    leftIcon={<SlidersHorizontalIcon size={18} />}
                    onClick={() => setShowColumnMenu((p) => !p)}
                  >
                    Columns
                    {visibleColumns.size < CUSTOMER_COLUMNS.length && (
                      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary-action text-white text-[10px] font-bold w-4 h-4 leading-none">
                        {CUSTOMER_COLUMNS.length - visibleColumns.size}
                      </span>
                    )}
                  </Button>
                  {/* Desktop dropdown (lg+) */}
                  {showColumnMenu && (
                    <div className="hidden lg:block absolute right-0 top-full mt-1 z-50 bg-white border border-[var(--border-default)] rounded-xl shadow-lg w-[260px] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-default)]">
                        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Show / Hide Columns
                        </p>
                        <button
                          type="button"
                          className="text-[12px] text-primary-action hover:underline font-medium"
                          onClick={() =>
                            setVisibleColumns(new Set(CUSTOMER_COLUMNS.map((c) => c.id)))
                          }
                        >
                          Reset
                        </button>
                      </div>
                      <div className="py-1 max-h-[360px] overflow-y-auto">
                        {CUSTOMER_COLUMNS.map((column) => {
                          const checked = visibleColumns.has(column.id);
                          return (
                            <button
                              key={column.id}
                              type="button"
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-[var(--bg-default-secondary)] transition-colors"
                              onClick={() => toggleColumn(column.id)}
                            >
                              <span
                                className={`flex items-center justify-center w-4 h-4 rounded border transition-colors shrink-0 ${
                                  checked
                                    ? "bg-primary-action border-primary-action"
                                    : "border-[rgba(0,0,0,0.2)] bg-white"
                                }`}
                              >
                                {checked && <CheckIcon size={10} weight="bold" color="white" />}
                              </span>
                              <span className="text-[13px] text-foreground leading-tight">
                                {column.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Tablet modal (md–lg) */}
                  {showColumnMenu && (
                    <div
                      className="hidden md:flex lg:hidden fixed inset-0 z-50 items-center justify-center bg-black/30 p-4"
                      onMouseDown={(e) => { if (e.target === e.currentTarget) setShowColumnMenu(false); }}
                    >
                      <Modal
                        variant="content"
                        actionLayout="none"
                        title="Show / Hide Columns"
                        onClose={() => setShowColumnMenu(false)}
                      >
                        <div className="w-[300px]">
                          <button
                            type="button"
                            className="text-[12px] text-primary-action hover:underline font-medium mb-2 block"
                            onClick={() =>
                              setVisibleColumns(new Set(CUSTOMER_COLUMNS.map((c) => c.id)))
                            }
                          >
                            Reset
                          </button>
                          <div className="max-h-[50vh] overflow-y-auto -mx-1">
                            {CUSTOMER_COLUMNS.map((column) => {
                              const checked = visibleColumns.has(column.id);
                              return (
                                <button
                                  key={column.id}
                                  type="button"
                                  className="flex items-center gap-2.5 w-full px-1 py-2 text-left hover:bg-[var(--bg-default-secondary)] rounded transition-colors"
                                  onClick={() => toggleColumn(column.id)}
                                >
                                  <span
                                    className={`flex items-center justify-center w-4 h-4 rounded border transition-colors shrink-0 ${
                                      checked
                                        ? "bg-primary-action border-primary-action"
                                        : "border-[rgba(0,0,0,0.2)] bg-white"
                                    }`}
                                  >
                                    {checked && <CheckIcon size={10} weight="bold" color="white" />}
                                  </span>
                                  <span className="text-[13px] text-foreground leading-tight">
                                    {column.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </Modal>
                    </div>
                  )}
                  {/* Mobile bottom sheet (< md) */}
                  <Sheet open={showColumnMenu} onOpenChange={setShowColumnMenu}>
                    <SheetContent side="bottom" showCloseButton={false} className="md:hidden rounded-t-2xl px-0 pb-safe">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
                        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Show / Hide Columns
                        </p>
                        <button
                          type="button"
                          className="text-[12px] text-primary-action hover:underline font-medium"
                          onClick={() =>
                            setVisibleColumns(new Set(CUSTOMER_COLUMNS.map((c) => c.id)))
                          }
                        >
                          Reset
                        </button>
                      </div>
                      <div className="py-1 max-h-[60vh] overflow-y-auto">
                        {CUSTOMER_COLUMNS.map((column) => {
                          const checked = visibleColumns.has(column.id);
                          return (
                            <button
                              key={column.id}
                              type="button"
                              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[var(--bg-default-secondary)] transition-colors"
                              onClick={() => toggleColumn(column.id)}
                            >
                              <span
                                className={`flex items-center justify-center w-5 h-5 rounded border transition-colors shrink-0 ${
                                  checked
                                    ? "bg-primary-action border-primary-action"
                                    : "border-[rgba(0,0,0,0.2)] bg-white"
                                }`}
                              >
                                {checked && <CheckIcon size={12} weight="bold" color="white" />}
                              </span>
                              <span className="text-[14px] text-foreground leading-tight">
                                {column.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="flex-1 lg:w-64">
                  <SearchInput
                    size="sm"
                    className="!h-10"
                    placeholder="Search clients…"
                    value={search}
                    onChange={(val) => {
                      setSearch(val);
                      setCurrentPage(1);
                    }}
                    onClear={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            )}
            {viewFilter === "product" && (
              <div className="w-full lg:w-56 lg:ml-auto">
                <SearchInput
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={setProductSearch}
                  onClear={() => setProductSearch("")}
                  size="sm"
                />
              </div>
            )}
          </div>

          {viewFilter === "nine-box" ? (
            <NineBoxTab
              clients={sorted}
              onCellOpen={(info) => {
                setNineBoxCell(info);
                setNineBoxDrawerOpen(true);
              }}
            />
          ) : viewFilter === "customer" ? (
            <>
              {/* Customer Table */}
              <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
                <Table className="table-fixed" style={{ width: tableWidth }}>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell
                        style={{ width: 60 }}
                        sortDirection={dirFor("rowIndex")}
                        onSortChange={handleSort("rowIndex")}
                      >
                        No.
                      </TableHeaderCell>
                      {col("clientId") && (
                        <TableHeaderCell
                          style={{ width: 100 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("id")}
                          onSortChange={handleSort("id")}
                        >
                          Client ID
                        </TableHeaderCell>
                      )}
                      {col("client") && (
                        <TableHeaderCell
                          style={{ width: 180 }}
                          sortDirection={dirFor("name")}
                          onSortChange={handleSort("name")}
                        >
                          Client
                        </TableHeaderCell>
                      )}
                      {col("aum") && (
                        <TableHeaderCell
                          style={{ width: 150 }}
                          sortDirection={dirFor("aum")}
                          onSortChange={handleSort("aum")}
                        >
                          AUM (THB)
                        </TableHeaderCell>
                      )}
                      {col("thaiStock") && (
                        <TableHeaderCell
                          style={{ width: 150 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("thaiStock")}
                          onSortChange={handleSort("thaiStock")}
                        >
                          หุ้นไทย (บาท)
                        </TableHeaderCell>
                      )}
                      {col("foreignStock") && (
                        <TableHeaderCell
                          style={{ width: 170 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("foreignStock")}
                          onSortChange={handleSort("foreignStock")}
                        >
                          หุ้นต่างประเทศ (บาท)
                        </TableHeaderCell>
                      )}
                      {col("derivatives") && (
                        <TableHeaderCell
                          style={{ width: 140 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("derivatives")}
                          onSortChange={handleSort("derivatives")}
                        >
                          TFEX (บาท)
                        </TableHeaderCell>
                      )}
                      {col("mutualFund") && (
                        <TableHeaderCell
                          style={{ width: 150 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("mutualFund")}
                          onSortChange={handleSort("mutualFund")}
                        >
                          กองทุนรวม (บาท)
                        </TableHeaderCell>
                      )}
                      {col("bond") && (
                        <TableHeaderCell
                          style={{ width: 150 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("bond")}
                          onSortChange={handleSort("bond")}
                        >
                          ตราสารหนี้ (บาท)
                        </TableHeaderCell>
                      )}
                      {col("foreignBond") && (
                        <TableHeaderCell
                          style={{ width: 200 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("foreignBond")}
                          onSortChange={handleSort("foreignBond")}
                        >
                          ตราสารหนี้ต่างประเทศ (บาท)
                        </TableHeaderCell>
                      )}
                      {col("structuredBond") && (
                        <TableHeaderCell
                          style={{ width: 210 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("structuredBond")}
                          onSortChange={handleSort("structuredBond")}
                        >
                          หุ้นกู้ที่มีอนุพันธ์แฝง (บาท)
                        </TableHeaderCell>
                      )}
                      {col("cashIdle") && (
                        <TableHeaderCell
                          style={{ width: 140 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("cashIdle")}
                          onSortChange={handleSort("cashIdle")}
                        >
                          เงินสด (บาท)
                        </TableHeaderCell>
                      )}
                      {col("plYtd") && (
                        <TableHeaderCell
                          style={{ width: 150 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("plYtd")}
                          onSortChange={handleSort("plYtd")}
                        >
                          กำไร/ขาดทุน (บาท)
                        </TableHeaderCell>
                      )}
                      {col("liabilities") && (
                        <TableHeaderCell
                          style={{ width: 140 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("liabilities")}
                          onSortChange={handleSort("liabilities")}
                        >
                          Liabilities
                        </TableHeaderCell>
                      )}
                      {col("nineBox") && (
                        <TableHeaderCell
                          style={{ width: 110 }}
                          className="whitespace-nowrap"
                          sortDirection={dirFor("nineBox")}
                          onSortChange={handleSort("nineBox")}
                        >
                          Nine Box
                        </TableHeaderCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((client) => {
                      const rowNo = originalIndexMap.get(client.id) ?? 0;

                      return (
                        <Tooltip
                          key={client.id}
                          content="View client profile"
                          side="top"
                          delayDuration={400}
                        >
                          <TableRow
                            className="cursor-pointer"
                            hoverable
                            onClick={() => openClient(client)}
                          >
                            <TableCell>
                              <p className="text-[13px] text-muted-foreground">
                                {rowNo}
                              </p>
                            </TableCell>
                            {col("clientId") && (
                              <TableCell>
                                <p className="text-[13px] text-muted-foreground font-mono">
                                  {client.id}
                                </p>
                              </TableCell>
                            )}
                            {col("client") && (
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    type="text"
                                    initials={getInitials(maskName(client.name, isPrivate))}
                                    size="s"
                                  />
                                  <p className="text-[14px] font-semibold text-foreground leading-tight truncate">
                                    {maskName(client.name, isPrivate)}
                                  </p>
                                </div>
                              </TableCell>
                            )}
                            {col("aum") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(parseAumToThb(client.aum))}
                                </p>
                              </TableCell>
                            )}
                            {col("thaiStock") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "หุ้นไทย"))}
                                </p>
                              </TableCell>
                            )}
                            {col("foreignStock") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "หุ้นต่างประเทศ"))}
                                </p>
                              </TableCell>
                            )}
                            {col("derivatives") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "อนุพันธ์"))}
                                </p>
                              </TableCell>
                            )}
                            {col("mutualFund") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "กองทุนรวม"))}
                                </p>
                              </TableCell>
                            )}
                            {col("bond") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "ตราสารหนี้"))}
                                </p>
                              </TableCell>
                            )}
                            {col("foreignBond") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "ตราสารหนี้ต่างประเทศ"))}
                                </p>
                              </TableCell>
                            )}
                            {col("structuredBond") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(getClientSliceAmount(client, "หุ้นกู้ที่มีอนุพันธ์แฝง"))}
                                </p>
                              </TableCell>
                            )}
                            {col("cashIdle") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(parseAumToThb(client.aum) * (client.cashIdlePct / 100))}
                                </p>
                              </TableCell>
                            )}
                            {col("plYtd") && (
                              <TableCell>
                                <p
                                  className={`text-[14px] font-semibold leading-tight ${client.plPositive ? "text-success" : "text-destructive"}`}
                                >
                                  {client.plYtd}
                                </p>
                              </TableCell>
                            )}
                            {col("liabilities") && (
                              <TableCell>
                                <p className="text-[14px] font-semibold text-foreground">
                                  {formatThbAmount(parseAumToThb(client.aum) * LIABILITIES_MULTIPLIER)}
                                </p>
                              </TableCell>
                            )}
                            {col("nineBox") && (
                              <TableCell>
                                <NineBoxCellPill client={client} />
                              </TableCell>
                            )}
                          </TableRow>
                        </Tooltip>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap-reverse items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-muted-foreground whitespace-nowrap">Show per page</p>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-[12px] border border-border rounded-md px-2 py-1 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-action"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[12px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(safePage - 1) * pageSize + 1}
                    </span>
                    {" – "}
                    <span className="font-medium text-foreground">
                      {Math.min(safePage * pageSize, sorted.length)}
                    </span>
                    {" of "}
                    <span className="font-medium text-foreground">
                      {sorted.length}
                    </span>{" "}
                    clients
                  </p>
                  <Pagination
                    totalPages={totalPages}
                    currentPage={safePage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Product Table */
            <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
              <Table className="table-fixed min-w-[640px]">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                    <TableHeaderCell className="w-[30%]">Product</TableHeaderCell>
                    <TableHeaderCell className="w-[18%] whitespace-nowrap"># Clients</TableHeaderCell>
                    <TableHeaderCell className="w-[26%] whitespace-nowrap">Total AUM (THB)</TableHeaderCell>
                    <TableHeaderCell className="w-[21%] whitespace-nowrap">Avg Allocation</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProductRows.map((row, index) => (
                    <TableRow
                      key={row.label}
                      className="cursor-pointer"
                      hoverable
                      onClick={() => {
                        setSelectedProduct(row);
                        const hasSub = (PRODUCT_SUB_DATA[row.label]?.length ?? 0) > 0;
                        setProductDetailTab(hasSub ? "sub" : "clients");
                        setProductDrawerOpen(true);
                      }}
                    >
                      <TableCell>
                        <p className="text-[13px] text-muted-foreground">{index + 1}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="relative shrink-0 size-2">
                            <img alt="" className="block size-full max-w-none" src={row.statusIcon} />
                          </span>
                          <p className="text-[14px] font-semibold text-foreground truncate">{row.label}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{row.clientCount}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{formatThbAmount(row.totalAmountThb)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{row.avgAllocationPct.toFixed(1)}%</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      {/* Client Detail Drawer */}
      <Sheet
        modal={false}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedClient(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {selectedClient && (
            <ClientDetailPanel
              client={selectedClient}
              onViewFull={() => router.push(`/client/${selectedClient.id}`)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Drawer */}
      <Sheet
        modal={false}
        open={productDrawerOpen}
        onOpenChange={(open) => {
          setProductDrawerOpen(open);
          if (!open) {
            setSelectedProduct(null);
            setProductDetailTab("sub");
            setExpandedSubIds(new Set());
            setProductPushClient(null);
            setProductPushMounted(false);
            setProductPushVisible(false);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {selectedProduct && (
            <div className="flex flex-col h-full relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-default)] shrink-0">
                <span className="relative shrink-0 size-3">
                  <img alt="" className="block size-full max-w-none" src={selectedProduct.statusIcon} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="type-subtitle-1 font-bold text-foreground truncate">{selectedProduct.label}</p>
                  <p className="type-caption text-muted-foreground">{selectedProduct.clientCount} clients</p>
                </div>
              </div>

              {/* Stats */}
              <div className="shrink-0">
                <StatCardRow
                  stats={[
                    {
                      label: "Total AUM",
                      value: (
                        <>
                          {formatThbAmount(selectedProduct.totalAmountThb)}{" "}
                          <span className="type-body-2 font-normal text-muted-foreground">THB</span>
                        </>
                      ),
                    },
                    {
                      label: "Avg Allocation",
                      value: `${selectedProduct.avgAllocationPct.toFixed(1)}%`,
                    },
                  ]}
                />
              </div>

              {/* Tabs */}
              {(() => {
                const subProducts: SubProduct[] = PRODUCT_SUB_DATA[selectedProduct.label] ?? [];
                const hasSub = subProducts.length > 0;
                return (
                  <>
                    {hasSub && (
                      <div className="shrink-0 px-4 pt-3 pb-0">
                        <TabGroup
                          items={[
                            { id: "sub", title: `Holdings (${subProducts.length})` },
                            { id: "clients", title: `Clients (${selectedProduct.clientCount})` },
                          ]}
                          activeId={productDetailTab}
                          size="sm"
                          onChange={(id) => setProductDetailTab(id as "sub" | "clients")}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                      {/* Sub-products tab */}
                      {hasSub && productDetailTab === "sub" && (
                        <div className="flex flex-col gap-2 p-4">
                          {/* Expand / Collapse All */}
                          <div className="flex justify-end sticky top-0 bg-white py-1 -mx-4 px-4 z-10">
                            {expandedSubIds.size === subProducts.length ? (
                              <button
                                type="button"
                                className="text-[12px] text-blue-600 hover:underline cursor-pointer"
                                onClick={() => setExpandedSubIds(new Set())}
                              >
                                Collapse All
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-[12px] text-blue-600 hover:underline cursor-pointer"
                                onClick={() => setExpandedSubIds(new Set(subProducts.map((s) => s.id)))}
                              >
                                Expand All
                              </button>
                            )}
                          </div>
                          {subProducts.map((sub) => {
                            const isExpanded = expandedSubIds.has(sub.id);
                            // Use first N holders as mock client data for this sub-product
                            const subHolders = selectedProduct.holders.slice(0, sub.clientCount);
                            return (
                              <div
                                key={sub.id}
                                className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden"
                              >
                                {/* Card header — clickable */}
                                <button
                                  type="button"
                                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                                  onClick={() => setExpandedSubIds((prev) => {
                                    const next = new Set(prev);
                                    isExpanded ? next.delete(sub.id) : next.add(sub.id);
                                    return next;
                                  })}
                                >
                                  {/* Ticker + name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {sub.ticker && (
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                          {sub.ticker}
                                        </span>
                                      )}
                                      <p className="text-[13px] font-semibold text-foreground truncate">{sub.name}</p>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground">{formatThbAmount(sub.totalAmountThb)} THB</p>
                                  </div>

                                  {/* Client count badge (prominent) */}
                                  <div className="shrink-0 flex flex-col items-center bg-[var(--bg-default-secondary)] rounded-lg px-3 py-1.5 min-w-[52px]">
                                    <span className="text-[18px] font-bold text-foreground leading-none">{sub.clientCount}</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">clients</span>
                                  </div>

                                  {/* Chevron */}
                                  <CaretDownIcon
                                    size={20}
                                    className={`text-[var(--text-default-tertiary)] shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {/* Expanded client list */}
                                {isExpanded && (
                                  <div className="border-t border-[rgba(0,0,0,0.07)]">
                                    {subHolders.map((holder) => (
                                      <button
                                        key={holder.clientId}
                                        type="button"
                                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                                        onClick={() => {
                                          const c = clients.find((cl) => cl.id === holder.clientId);
                                          if (c) {
                                            setProductPushClient(c);
                                            setProductPushMounted(true);
                                            requestAnimationFrame(() => setProductPushVisible(true));
                                          }
                                        }}
                                      >
                                        <Avatar type="text" initials={getInitials(maskName(holder.clientName, isPrivate))} size="s" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-semibold text-foreground truncate">{maskName(holder.clientName, isPrivate)}</p>
                                          <p className="type-caption text-muted-foreground">{holder.clientId} · {holder.tier}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <p className="text-[12px] font-bold text-foreground">{holder.allocationPct.toFixed(1)}%</p>
                                          <p className="type-caption text-muted-foreground">{formatThbAmount(holder.amountThb)} THB</p>
                                        </div>
                                        <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Clients tab */}
                      {(!hasSub || productDetailTab === "clients") && (
                        <div className="flex flex-col gap-2 p-4">
                          {selectedProduct.holders.map((holder) => (
                            <button
                              key={holder.clientId}
                              type="button"
                              className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-3 flex items-center gap-3 w-full text-left hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                              onClick={() => {
                                const c = clients.find((cl) => cl.id === holder.clientId);
                                if (c) {
                                  setProductPushClient(c);
                                  setProductPushMounted(true);
                                  requestAnimationFrame(() => setProductPushVisible(true));
                                }
                              }}
                            >
                              <Avatar type="text" initials={getInitials(maskName(holder.clientName, isPrivate))} size="s" />
                              <div className="flex-1 min-w-0">
                                <p className="type-subtitle-2 font-semibold text-foreground truncate">{maskName(holder.clientName, isPrivate)}</p>
                                <p className="type-caption text-muted-foreground">{holder.clientId} · {holder.tier}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="type-subtitle-2 font-bold text-foreground">{holder.allocationPct.toFixed(1)}%</p>
                                <p className="type-caption text-muted-foreground">{formatThbAmount(holder.amountThb)} THB</p>
                              </div>
                              <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Push overlay: client detail */}
              {productPushMounted && productPushClient && (
                <div
                  className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
                    productPushVisible ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <ClientDetailPanel
                    client={productPushClient}
                    onViewFull={() => router.push(`/client/${productPushClient.id}`)}
                    onBack={() => {
                      setProductPushVisible(false);
                      setTimeout(() => {
                        setProductPushMounted(false);
                        setProductPushClient(null);
                      }, 300);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Nine Box Cell Drawer */}
      <Sheet
        modal={false}
        open={nineBoxDrawerOpen}
        onOpenChange={(open) => {
          setNineBoxDrawerOpen(open);
          if (!open) {
            setNineBoxCell(null);
            setNineBoxPushVisible(false);
            setTimeout(() => {
              setNineBoxPushMounted(false);
              setNineBoxPushClient(null);
            }, 300);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {nineBoxCell && (() => {
            const style = NINE_BOX_HEAT_STYLES[nineBoxCell.heat];
            return (
              <div className="flex flex-col h-full relative overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--border-default)] shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full shrink-0 ${style.dot}`} />
                    <p className="type-subtitle-1 font-bold text-foreground">{nineBoxCell.label}</p>
                  </div>
                  <p className="type-caption text-muted-foreground mt-1 pl-[18px]">
                    {nineBoxCell.aumLabel} AUM · {nineBoxCell.aiLabel} AI Score
                  </p>
                </div>

                {/* Client list */}
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  {nineBoxCell.clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="size-12 rounded-full bg-[var(--bg-default-secondary)] flex items-center justify-center">
                        <UsersIcon size={24} className="text-muted-foreground" weight="duotone" />
                      </div>
                      <p className="type-body-2 text-muted-foreground">No clients in this segment</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-4">
                      <p className="type-caption text-muted-foreground px-1">
                        {nineBoxCell.clients.length} client{nineBoxCell.clients.length !== 1 ? "s" : ""}
                      </p>
                      {nineBoxCell.clients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-3 flex items-center gap-3 w-full text-left hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                          onClick={() => {
                            setNineBoxPushClient(c);
                            setNineBoxPushMounted(true);
                            requestAnimationFrame(() => setNineBoxPushVisible(true));
                          }}
                        >
                          <Avatar type="text" initials={getInitials(c.name)} size="s" />
                          <div className="flex-1 min-w-0">
                            <p className="type-subtitle-2 font-semibold text-foreground truncate">{c.name}</p>
                            <p className="type-caption text-muted-foreground">{c.tier} · {c.id}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="type-caption font-semibold text-foreground">{c.aum}</p>
                            <p className="type-caption text-muted-foreground">AI {c.aiScore}</p>
                          </div>
                          <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Push overlay: client detail */}
                {nineBoxPushMounted && nineBoxPushClient && (
                  <div
                    className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
                      nineBoxPushVisible ? "translate-x-0" : "translate-x-full"
                    }`}
                  >
                    <ClientDetailPanel
                      client={nineBoxPushClient}
                      onViewFull={() => router.push(`/client/${nineBoxPushClient.id}`)}
                      onBack={() => {
                        setNineBoxPushVisible(false);
                        setTimeout(() => {
                          setNineBoxPushMounted(false);
                          setNineBoxPushClient(null);
                        }, 300);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}
