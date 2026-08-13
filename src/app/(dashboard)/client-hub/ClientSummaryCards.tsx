"use client";

import { useMemo } from "react";
import { Avatar, BottomSheet } from "@sarunyu/system-one";
import { InfoIcon } from "@phosphor-icons/react";
import { usePrivacy } from "@/contexts/privacy-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePopover } from "@/hooks/use-popover";
import { maskName } from "@/lib/mask-name";
import { getInitials, formatMillionThb } from "@/lib/client-utils";
import {
  getClientTotals,
  getSegmentBreakdown,
  getKycDueClients,
  getTopClientsByAum,
} from "./client-hub-data";
import type { Client } from "@/types/domain";

const SEGMENT_COLORS: Record<string, string> = {
  UHNW: "#3b82f6",
  HNW: "#94a3b8",
  Affluent: "#f59e0b",
};

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

export function ClientSummaryCards({ clients }: { clients: Client[] }) {
  const { isPrivate } = usePrivacy();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const segment = usePopover();
  const asset = usePopover();
  const kyc = usePopover();

  const { totalAum, totalCash } = useMemo(() => getClientTotals(clients), [clients]);
  const segmentBreakdown = useMemo(() => getSegmentBreakdown(clients), [clients]);
  const kycDueClients = useMemo(() => getKycDueClients(clients), [clients]);
  const topClients = useMemo(() => getTopClientsByAum(clients), [clients]);

  const segmentBreakdownContent = (
    <>
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
    </>
  );

  const assetListContent = (
    <>
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
    </>
  );

  const kycListContent = (
    <>
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
    </>
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
        {!isMobile && segment.open && clients.length > 0 && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">สัดส่วนตาม Segment</p>
            {segmentBreakdownContent}
          </div>
        )}
        {isMobile && (
          <BottomSheet
            open={segment.open && clients.length > 0}
            onOpenChange={segment.setOpen}
            title="สัดส่วนตาม Segment"
            showHandle
            showHeader
            rightSide="none"
            contentClassName="flex flex-col gap-1 p-4"
          >
            {segmentBreakdownContent}
          </BottomSheet>
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
        {!isMobile && asset.open && (
          <PopoverList title="ลูกค้าเรียงตามมูลค่าทรัพย์สิน">
            {assetListContent}
          </PopoverList>
        )}
        {isMobile && (
          <BottomSheet
            open={asset.open}
            onOpenChange={asset.setOpen}
            title="ลูกค้าเรียงตามมูลค่าทรัพย์สิน"
            showHandle
            showHeader
            rightSide="none"
            contentClassName="flex flex-col p-0"
          >
            {assetListContent}
          </BottomSheet>
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
        {!isMobile && kyc.open && (
          <PopoverList title="ลูกค้าที่ KYC ใกล้หมดอายุ">
            {kycListContent}
          </PopoverList>
        )}
        {isMobile && (
          <BottomSheet
            open={kyc.open}
            onOpenChange={kyc.setOpen}
            title="ลูกค้าที่ KYC ใกล้หมดอายุ"
            showHandle
            showHeader
            rightSide="none"
            contentClassName="flex flex-col p-0"
          >
            {kycListContent}
          </BottomSheet>
        )}
      </div>

      {/* 5. Cash Under Advice */}
      <StaticCard label="Cash Under Advice" value={formatMillionThb(totalCash)} sub="เงินรอลงทุน" />
    </div>
  );
}
