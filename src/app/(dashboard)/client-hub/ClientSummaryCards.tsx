"use client";

import { useMemo, useState } from "react";
import { Avatar, BottomSheet, Button } from "@sarunyu/system-one";
import { InfoIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { usePrivacy } from "@/contexts/privacy-context";
import { useCountUp } from "@/hooks/use-count-up";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePopover } from "@/hooks/use-popover";
import { maskName } from "@/lib/mask-name";
import { getInitials, formatMillionThb } from "@/lib/client-utils";
import {
  getClientTotals,
  getSegmentBreakdown,
  getKycDueClients,
  getTopClientsByAum,
  getClientsByCash,
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

/* Every card in the row — interactive or not, real or skeleton — is the same
   three stacked lines: a small-caps label, one big number, one caption. */

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function CardValue({ colorClass = "text-foreground", children }: { colorClass?: string; children: React.ReactNode }) {
  return <p className={`text-[24px] font-bold leading-none tabular-nums ${colorClass}`}>{children}</p>;
}

function CardSub({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground">{children}</p>;
}

function StaticCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-border">
      <CardLabel>{label}</CardLabel>
      <CardValue>{value}</CardValue>
      <CardSub>{sub}</CardSub>
    </div>
  );
}

/** Matches StaticCard's shape — label, value, sub line. */
function SummaryCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-border">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * How much list the popover shows before it scrolls. Same number
 * `CompactList` caps its dialog lists at, so the app's two "peek at a list"
 * surfaces agree on what a peek is worth.
 */
const POPOVER_LIST_MAX_H = "max-h-[380px]";

/**
 * Roughly how many rows fit in {@link POPOVER_LIST_MAX_H} — a `ClientListRow`
 * is about 57px (`py-2.5`, an `xs` avatar, two lines of text, a divider), so
 * six and change.
 *
 * Approximate on purpose: it only decides whether "View all" is offered, and
 * being off by one costs nothing either way — a scrolling popover with no
 * button is still readable, and a button over a list that happens to fit still
 * opens a legitimately roomier view of it.
 */
const POPOVER_PEEK_ROWS = 6;

/**
 * Panel width — a definite size, not `min-w` over the card's own width.
 *
 * A KPI card is 189–237px across the widths this popover is used at, and a
 * client row doesn't fit in that: at the old 260px floor the sub line wrapped
 * ("ของ AUM" onto its own line) and every name past ~14 characters truncated.
 * 360px leaves the name/sub column about 200px, which clears the longest name
 * and the widest sub line in the data with room to spare.
 *
 * Definite rather than shrink-to-fit because the name uses `truncate`: with an
 * indefinite width the panel would size to the longest *untruncated* name, so
 * one long name would widen the whole panel and truncation would never happen.
 */
const POPOVER_PANEL_W = "w-[360px]";

/**
 * @param position Which of the card's edges the panel hangs from, as Tailwind
 *   classes — per card, and per breakpoint, because a card's column changes
 *   with the grid. The panel is always wider than the card, so it has to grow
 *   sideways, and `main` clips horizontal overflow rather than scrolling it
 *   (see the dashboard layout's `overflow-x-clip`): grow the wrong way off the
 *   outermost column and the panel comes back with its edge shaved off. The
 *   rule is simply that the row's last card pins right — which card that is
 *   differs between the 3-column and 5-column layouts.
 * @param onViewAll Shown top-right, beside the heading, when the list is longer
 *   than the panel can hold. The height cap is what makes it necessary: without
 *   one the panel grew to fit every row, and since it is `absolute` inside a
 *   scrolling `main`, a few hundred clients both stretched the page's own
 *   scrollbar and put the tail of the list past the fold — reachable only by
 *   scrolling the whole page while keeping the pointer inside a popover that
 *   closes 120ms after it leaves.
 *
 *   Not built on `CompactList`, which is the same idea for dialogs: its rows
 *   sit inside padded content, and these are full-bleed with their own `px-4`,
 *   so its `self-end` button would either hang off the edge or force the rows
 *   to indent. The cap constant is shared instead of the component.
 */
function PopoverList({
  title,
  position = "left-0",
  onViewAll,
  children,
}: {
  title: string;
  position?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-xl overflow-hidden ${POPOVER_PANEL_W} ${position}`}
    >
      {/* `min-h-7` is the `sm` Button's own height, so the heading sits in the
          same place whether or not there's a button beside it — a panel with
          "View all" and one without shouldn't start their lists at different
          heights. `-mr-2` cancels the button's own `pr-2` so its label ends on
          the same 16px margin the rows' amounts do. */}
      <div className="flex min-h-7 items-center justify-between gap-2 px-4 pt-2 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        {onViewAll && (
          <Button variant="plain" size="sm" className="-mr-2 shrink-0" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>
      <div className={`${POPOVER_LIST_MAX_H} overflow-y-auto`}>{children}</div>
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

/**
 * A KPI card whose ⓘ opens a ranked client list — three of the five are this
 * shape, so they share one component rather than three copies of the same
 * popover / bottom-sheet / modal wiring.
 *
 * Three surfaces, one `children`:
 *  - **desktop popover** — a peek, capped and scrolling, with "View all" out
 *  - **mobile bottom sheet** — the tap target already is the full list, so no
 *    "View all"; it just scrolls inside the sheet's own 80vh
 *  - **full-list dialog** — where "View all" goes
 *
 * The list is passed in as an element, so it renders in whichever surface is
 * mounted without the caller building it more than once.
 */
function ClientListCard({
  label,
  value,
  sub,
  valueColorClass,
  title,
  rowCount,
  position,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  valueColorClass?: string;
  /** Heading over the list, in all three surfaces. */
  title: string;
  /** Decides whether the popover offers "View all" — see POPOVER_PEEK_ROWS. */
  rowCount: number;
  /** Where this card's panel hangs from — see `PopoverList`. */
  position?: string;
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { open, setOpen, ref, hoverProps } = usePopover();
  const [allOpen, setAllOpen] = useState(false);

  return (
    <>
      <div ref={ref} className="relative min-w-0" {...hoverProps}>
        <CardShell open={open} onClick={() => setOpen((p) => !p)}>
          <div className="flex items-center justify-between gap-2">
            <CardLabel>{label}</CardLabel>
            <PopoverChevron open={open} />
          </div>
          <CardValue colorClass={valueColorClass}>{value}</CardValue>
          <CardSub>{sub}</CardSub>
        </CardShell>
        {!isMobile && open && (
          <PopoverList
            title={title}
            position={position}
            onViewAll={
              rowCount > POPOVER_PEEK_ROWS
                ? () => {
                    setOpen(false);
                    setAllOpen(true);
                  }
                : undefined
            }
          >
            {children}
          </PopoverList>
        )}
        {isMobile && (
          <BottomSheet
            open={open}
            onOpenChange={setOpen}
            title={title}
            showHandle
            showHeader
            rightSide="none"
            // `min-h-0` so this can shrink below its content inside the sheet's
            // `flex flex-col` / `max-h-[80vh]`, which is what lets the scroll
            // engage. Without it a long list overflowed the sheet upward — the
            // drawer caps its own height but doesn't scroll what's inside.
            contentClassName="flex flex-col p-0 overflow-y-auto min-h-0"
          >
            {children}
          </BottomSheet>
        )}
      </div>

      {/* Rendered outside the card's wrapper so it isn't inside the `relative`
          box the popover is positioned against. Fixed either way, but nesting a
          full-screen surface inside one grid cell reads as a mistake. */}
      <ResponsiveDialog
        open={allOpen}
        onOpenChange={setAllOpen}
        title={title}
        mobileContentClassName="flex flex-col p-0 overflow-y-auto min-h-0"
        desktopContentClassName="flex flex-col min-w-[420px] max-w-[520px] max-h-[70vh] overflow-y-auto"
      >
        {children}
      </ResponsiveDialog>
    </>
  );
}

export function ClientSummaryCards({ clients, isLoading }: { clients: Client[]; isLoading?: boolean }) {
  const { isPrivate } = usePrivacy();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const {
    open: segmentOpen,
    setOpen: setSegmentOpen,
    ref: segmentRef,
    hoverProps: segmentHoverProps,
  } = usePopover();
  // The three list cards own their own popover state inside `ClientListCard`;
  // only Total Clients still needs it here, since its panel is a segment bar
  // rather than a client list.

  const { totalAum, totalCash } = useMemo(() => getClientTotals(clients), [clients]);
  const segmentBreakdown = useMemo(() => getSegmentBreakdown(clients), [clients]);
  const kycDueClients = useMemo(() => getKycDueClients(clients), [clients]);
  const topClients = useMemo(() => getTopClientsByAum(clients), [clients]);
  const cashClients = useMemo(() => getClientsByCash(clients), [clients]);

  const animatedClientCount = useCountUp(clients.length);
  const animatedKycCount = useCountUp(kycDueClients.length);
  const animatedTotalAum = useCountUp(totalAum);
  const animatedTotalCash = useCountUp(totalCash);
  const animatedAssetValue = useCountUp(totalAum - totalCash);

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

  /* Ranked like the asset list, because the question this card answers is the
     same shape — "whose cash is this?" — and the answer is only useful in the
     order you'd act on it. The percentage rides along in the sub line: ฿ 44M
     idle out of ฿ 890M is a different conversation from ฿ 57M out of ฿ 180M. */
  const cashListContent = (
    <>
      {cashClients.length === 0
        ? <p className="text-[13px] text-muted-foreground px-4 py-3">ไม่มีลูกค้าที่มีเงินรอลงทุน</p>
        : cashClients.map(({ client, cashThb }, i) => (
            <ClientListRow
              key={client.id}
              rank={i + 1}
              name={maskName(client.name, isPrivate)}
              sub={`${client.tier} · ${client.cashIdlePct}% ของ AUM`}
              right={
                <span className="text-[12px] font-bold text-foreground shrink-0">
                  {formatMillionThb(cashThb)}
                </span>
              }
            />
          ))
      }
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Clients */}
      <div ref={segmentRef} className="relative min-w-0" {...segmentHoverProps}>
        <CardShell open={segmentOpen} onClick={() => setSegmentOpen((p) => !p)}>
          <div className="flex items-center justify-between gap-2">
            <CardLabel>Total Clients</CardLabel>
            <PopoverChevron open={segmentOpen} />
          </div>
          <CardValue>{Math.round(animatedClientCount)}</CardValue>
          <CardSub>ราย</CardSub>
        </CardShell>
        {!isMobile && segmentOpen && clients.length > 0 && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">สัดส่วนตาม Segment</p>
            {segmentBreakdownContent}
          </div>
        )}
        {isMobile && (
          <BottomSheet
            open={segmentOpen && clients.length > 0}
            onOpenChange={setSegmentOpen}
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
      <StaticCard label="Wealth Under Advice" value={formatMillionThb(animatedTotalAum)} sub="AUM รวมทั้งหมด" />

      {/* 3. มูลค่าทรัพย์สิน — last in the row at 3 columns (768–1023px), third
             of five above that, so which edge its panel hangs from flips at
             `lg`. See `PopoverList`'s `position`. */}
      <ClientListCard
        label="มูลค่าทรัพย์สิน"
        value={formatMillionThb(animatedAssetValue)}
        sub="ไม่รวม cash"
        title="ลูกค้าเรียงตามมูลค่าทรัพย์สิน"
        rowCount={topClients.length}
        position="right-0 lg:right-auto lg:left-0"
      >
        {assetListContent}
      </ClientListCard>

      {/* 4. KYC ครบกำหนด — first of the second row at 3 columns, fourth of five
             above that. Never the row's last card either way, so the default
             left anchor always has room to its right. */}
      <ClientListCard
        label="KYC ครบกำหนด"
        value={String(Math.round(animatedKycCount))}
        sub="ภายใน 30 วัน"
        valueColorClass={kycDueClients.length > 0 ? "text-[var(--text-warning-primary)]" : "text-foreground"}
        title="ลูกค้าที่ KYC ใกล้หมดอายุ"
        rowCount={kycDueClients.length}
      >
        {kycListContent}
      </ClientListCard>

      {/* 5. Cash Under Advice — last of five at `lg`, and pinning right also
             works from the second column it sits in below that, so this one
             needs no breakpoint switch. */}
      <ClientListCard
        label="Cash Under Advice"
        value={formatMillionThb(animatedTotalCash)}
        sub="เงินรอลงทุน"
        title="ลูกค้าเรียงตามเงินรอลงทุน"
        rowCount={cashClients.length}
        position="right-0"
      >
        {cashListContent}
      </ClientListCard>
    </div>
  );
}
