"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@sarunyu/system-one";
import {
  ArrowLeftIcon,
  CaretDoubleDownIcon,
  CaretDownIcon,
  CaretUpIcon,
  FileTextIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import {
  ALL_OVERSEAS_BONDS,
  ALL_OVERSEAS_BONDS_COUNT,
  ALL_OVERSEAS_BONDS_PAGE_SIZE,
  ALL_OVERSEAS_BONDS_UPDATED_AT,
  filterAllOverseasBonds,
  type CouponFilter,
  type GlobalBondRow,
  type MaturityFilter,
  type TickerFilter,
  type YieldFilter,
} from "./global-bond-data";

const BORDER_COLOR = "rgba(0,0,0,0.1)";
const BONDS_COL_MIN_CLS = "min-w-[400px]";
const TABLE_SHADOW = "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";
const HEADER_CLS = "text-sm leading-5 text-[#6a7282]";

const TICKER_OPTIONS: { id: TickerFilter; label: string }[] = [
  { id: "all", label: "All Ticker" },
  { id: "AAPL", label: "AAPL" },
  { id: "MSFT", label: "MSFT" },
  { id: "META", label: "META" },
  { id: "AMZN", label: "AMZN" },
];

const COUPON_OPTIONS: { id: CouponFilter; label: string }[] = [
  { id: "all", label: "All Coupon Rate" },
  { id: "lt2", label: "< 2%" },
  { id: "2-3", label: "2–3%" },
  { id: "3-4", label: "3–4%" },
  { id: "gt4", label: "> 4%" },
];

const YIELD_OPTIONS: { id: YieldFilter; label: string }[] = [
  { id: "all", label: "ผลตอบแทนโดยประมาณ" },
  { id: "lt2", label: "< 2%" },
  { id: "2-3", label: "2–3%" },
  { id: "3-4", label: "3–4%" },
  { id: "gt4", label: "> 4%" },
];

const MATURITY_OPTIONS: { id: MaturityFilter; label: string }[] = [
  { id: "all", label: "ระยะเวลาครบกำหนด" },
  { id: "short", label: "ระยะสั้น (≤3 ปี)" },
  { id: "long", label: "ระยะยาว (> 3ปี)" },
];

const THAI_MONTH_ABBR: Record<string, string> = {
  January: "ม.ค.",
  February: "ก.พ.",
  March: "มี.ค.",
  April: "เม.ย.",
  May: "พ.ค.",
  June: "มิ.ย.",
  July: "ก.ค.",
  August: "ส.ค.",
  September: "ก.ย.",
  October: "ต.ค.",
  November: "พ.ย.",
  December: "ธ.ค.",
};

function formatUpdatedAtMobile(dateStr: string): string {
  const match = dateStr.match(/^(\d+)\s+(\w+)\s+(\d{4})\s+-\s+(\d{2})\.(\d{2})$/);
  if (!match) return dateStr;
  const [, day, monthEn, year, hour, minute] = match;
  const thaiMonth = THAI_MONTH_ABBR[monthEn] ?? monthEn;
  return `${day} ${thaiMonth} ${Number(year) + 543} - ${hour}:${minute}`;
}

function formatUpdatedAtTablet(dateStr: string): string {
  return dateStr.replace("September", "Sep").replace("August", "Aug");
}

const headerBorder = (opts?: { right?: boolean; left?: boolean }) => ({
  borderBottom: `1px solid ${BORDER_COLOR}`,
  borderRight: opts?.right === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderLeft: opts?.left ? `1px solid ${BORDER_COLOR}` : undefined,
});

const cellBorder = (opts?: { bottom?: boolean }) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
});

function FilterDropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  const selected = options.find((o) => o.id === value) ?? options[0];
  const isPlaceholder = value === "all";

  return (
    <div className="relative flex min-w-0 flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={selected.label}
        className="absolute inset-0 z-[1] h-full w-full cursor-pointer opacity-0"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="flex w-full min-h-[32px] items-center gap-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2">
        <span
          className={`min-w-0 flex-1 truncate text-sm leading-[22px] ${
            isPlaceholder ? "text-[rgba(0,0,0,0.3)]" : "text-[#101828]"
          }`}
        >
          {selected.label}
        </span>
        <CaretDownIcon size={20} className="shrink-0 text-[#101828]" />
      </div>
    </div>
  );
}

function IssuerLogo({ src }: { src: string }) {
  return (
    <div className="flex shrink-0 items-center py-0.5">
      <div className="relative size-5 rounded overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <img alt="" className="absolute inset-0 size-full object-cover rounded pointer-events-none" src={src} />
      </div>
    </div>
  );
}

function TopPickTag({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded bg-[#fff7ed] text-[#f54a00] whitespace-nowrap ${
        small ? "px-1 py-0.5 text-[9px] leading-[14px]" : "px-1 py-0.5 text-xs leading-4"
      }`}
    >
      Top Pick
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start w-full text-sm leading-[22px]">
      <span className="flex-1 text-[#4a5565]">{label}</span>
      <span className="shrink-0 text-[#101828] text-right whitespace-nowrap">{value}</span>
    </div>
  );
}

function AllBondsFilterPanel({
  tickerFilter,
  couponFilter,
  yieldFilter,
  maturityFilter,
  onTickerChange,
  onCouponChange,
  onYieldChange,
  onMaturityChange,
  onClear,
}: {
  tickerFilter: TickerFilter;
  couponFilter: CouponFilter;
  yieldFilter: YieldFilter;
  maturityFilter: MaturityFilter;
  onTickerChange: (id: TickerFilter) => void;
  onCouponChange: (id: CouponFilter) => void;
  onYieldChange: (id: YieldFilter) => void;
  onMaturityChange: (id: MaturityFilter) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-3">
      <FilterDropdown value={tickerFilter} options={TICKER_OPTIONS} onChange={onTickerChange} />
      <FilterDropdown value={couponFilter} options={COUPON_OPTIONS} onChange={onCouponChange} />
      <FilterDropdown value={yieldFilter} options={YIELD_OPTIONS} onChange={onYieldChange} />
      <FilterDropdown value={maturityFilter} options={MATURITY_OPTIONS} onChange={onMaturityChange} />
      <button
        type="button"
        onClick={onClear}
        className="self-start cursor-pointer rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3.5 py-2 text-sm font-medium leading-[22px] text-[#0a6ee7] whitespace-nowrap"
      >
        ล้างตัวเลือกทั้งหมด
      </button>
    </div>
  );
}

function AllBondsAccordionList({ bonds }: { bonds: GlobalBondRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedId(null);
  }, [bonds]);

  if (bonds.length === 0) {
    return (
      <div
        className="w-full rounded-lg overflow-hidden bg-white px-4 py-10 text-center text-sm text-[#6a7282]"
        style={{ border: `1px solid ${BORDER_COLOR}` }}
      >
        ไม่พบรายการที่ตรงกับตัวกรอง
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full rounded-lg overflow-hidden bg-white"
      style={{ border: `1px solid rgba(0,0,0,0.08)` }}
    >
      {bonds.map((row, i) => {
        const expanded = expandedId === row.id;
        const isLast = i === bonds.length - 1;
        return (
          <div
            key={row.id}
            className="w-full"
            style={{
              borderBottom: isLast ? undefined : `1px solid ${BORDER_COLOR}`,
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : row.id)}
              className="flex w-full items-center gap-2 p-3 bg-white border-none cursor-pointer text-left"
            >
              <div
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <BondCheckbox />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <IssuerLogo src={row.logo} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-bold leading-5 text-[#4a5565]">
                    {row.name}
                  </span>
                  <div className="flex min-h-[18px] items-center gap-0.5">
                    <span className="text-xs leading-4 text-[#4a5565]">{row.isin}</span>
                    {row.topPick && <TopPickTag small />}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-normal leading-5 text-[#4a5565]">{row.yieldPct}</span>
                  {expanded ? (
                    <CaretUpIcon size={22} className="text-[#4a5565]" />
                  ) : (
                    <CaretDownIcon size={22} className="text-[#4a5565]" />
                  )}
                </div>
              </div>
            </button>
            {expanded && (
              <div className="flex flex-col items-center gap-3 px-3 pb-3 w-full">
                <div className="flex w-full flex-col gap-1 rounded-md bg-[#f9fafb] px-3 py-2">
                  <DetailRow label="Currency" value={row.currency} />
                  <DetailRow label="Coupon Rate" value={row.couponRate} />
                  <DetailRow label="Price" value={row.price} />
                  <DetailRow label="ผลตอบแทนโดยประมาณ" value={row.yieldPct} />
                  <DetailRow label="วันครบกำหนด" value={row.maturity} />
                  <DetailRow label="ระยะเวลา (ปี)" value={row.duration} />
                  <div className="flex w-full items-start gap-3 text-sm leading-5">
                    <span className="flex-1 text-[#4a5565]">เอกสารที่เกี่ยวข้อง</span>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-0.5 border-none bg-transparent p-0"
                    >
                      <span className="text-sm text-[#2b7fff] underline">Factsheet</span>
                      <FileTextIcon size={14} color="#2b7fff" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FactsheetButton() {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-0.5 px-1 pr-1.5 py-1 rounded border text-xs font-medium leading-[18px] text-[#101828] bg-white whitespace-nowrap"
      style={{ borderColor: BORDER_COLOR }}
    >
      <FileTextIcon size={16} className="shrink-0" />
      Factsheet
    </button>
  );
}

function BondCheckbox() {
  return (
    <div className="relative flex size-6 shrink-0 items-center justify-center">
      <div
        className="size-4 rounded-[2px] border-[1.5px] border-[rgba(0,0,0,0.1)] bg-white"
        aria-hidden
      />
    </div>
  );
}

function AllBondsTable({ bonds }: { bonds: GlobalBondRow[] }) {
  if (bonds.length === 0) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden bg-white px-4 py-10 text-center text-sm text-[#6a7282]"
        style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
      >
        ไม่พบรายการที่ตรงกับตัวกรอง
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-stretch min-w-[1400px]">
          <div className={`flex flex-col w-[400px] shrink-0 ${BONDS_COL_MIN_CLS}`}>
            <div className="flex h-11 items-center px-4" style={headerBorder({ left: true })}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Bonds</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <IssuerLogo src={row.logo} />
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  <span className="min-w-0 truncate text-sm leading-5 text-[#101828]">{row.name}</span>
                  {row.topPick && <TopPickTag />}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[138px] shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ISIN</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.isin}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[80px] shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Currency</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.currency}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Coupon Rate</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.couponRate}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[81px] shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Price</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.price}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ผลตอบแทนโดยประมาณ</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.yieldPct}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.maturity}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ระยะเวลา (ปี)</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <span className="text-sm leading-5 text-[#101828]">{row.duration}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-3" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>เอกสาร</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-3 py-[11px] min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <FactsheetButton />
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorder({ right: false })} />
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]"
                style={cellBorder({ bottom: i === bonds.length - 1 ? false : undefined })}
              >
                <BondCheckbox />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalBondAllPage({ onBack }: { onBack: () => void }) {
  const [tickerFilter, setTickerFilter] = useState<TickerFilter>("all");
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("all");
  const [yieldFilter, setYieldFilter] = useState<YieldFilter>("all");
  const [maturityFilter, setMaturityFilter] = useState<MaturityFilter>("all");
  const [visibleCount, setVisibleCount] = useState(ALL_OVERSEAS_BONDS_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updatedAtMobile = formatUpdatedAtMobile(ALL_OVERSEAS_BONDS_UPDATED_AT);
  const updatedAtTablet = formatUpdatedAtTablet(ALL_OVERSEAS_BONDS_UPDATED_AT);

  const filteredBonds = useMemo(
    () =>
      filterAllOverseasBonds(
        ALL_OVERSEAS_BONDS,
        tickerFilter,
        couponFilter,
        yieldFilter,
        maturityFilter,
      ),
    [tickerFilter, couponFilter, yieldFilter, maturityFilter],
  );

  const visibleBonds = useMemo(
    () => filteredBonds.slice(0, visibleCount),
    [filteredBonds, visibleCount],
  );

  const hasActiveFilters =
    tickerFilter !== "all" ||
    couponFilter !== "all" ||
    yieldFilter !== "all" ||
    maturityFilter !== "all";

  const displayCount = hasActiveFilters ? filteredBonds.length : ALL_OVERSEAS_BONDS_COUNT;
  const canLoadMore = visibleCount < filteredBonds.length;

  const clearFilters = () => {
    setTickerFilter("all");
    setCouponFilter("all");
    setYieldFilter("all");
    setMaturityFilter("all");
    setVisibleCount(ALL_OVERSEAS_BONDS_PAGE_SIZE);
  };

  useEffect(() => {
    setVisibleCount(ALL_OVERSEAS_BONDS_PAGE_SIZE);
  }, [tickerFilter, couponFilter, yieldFilter, maturityFilter]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full pb-8 md:pb-8 lg:pb-20 bg-gradient-to-b from-white from-[43.451%] to-transparent">
      <div className="flex md:hidden w-full items-center gap-2 border-b border-[rgba(0,0,0,0.1)] px-4 py-3">
        <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
          <ArrowLeftIcon size={24} />
        </Button>
        <h1 className="flex-1 min-w-0 text-base font-bold leading-6 text-[#101828] text-center truncate">
          All Overseas Bonds
        </h1>
        <div className="size-6 shrink-0" aria-hidden />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[1280px] px-4 pt-4 md:gap-8 md:px-8 md:pt-6 lg:px-20">
        <div className="hidden md:flex gap-2 items-center h-[46px] py-2">
          <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
            <ArrowLeftIcon size={20} />
          </Button>
          <h1 className="flex-1 min-w-0 text-lg font-bold leading-[26px] text-[#101828] truncate">
            All Overseas Bonds
          </h1>
        </div>

        <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-xl p-4 lg:gap-6 lg:p-8">
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 size-full max-w-none object-cover pointer-events-none rounded-xl"
            src="/global-bond-all-hero.png"
          />
          <div className="relative z-[1] flex w-full flex-col gap-4 lg:gap-6">
            {/* Mobile banner — stacked: title → subtitle → filter button */}
            <div className="flex w-full flex-col items-start gap-4 md:hidden">
              <div className="flex w-full flex-col gap-2">
                <p className="text-2xl font-bold leading-9 text-[rgba(0,0,0,0.85)]">
                  All Overseas Bonds
                </p>
                <p className="max-w-[211px] text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
                  รวม Overseas bonds ทั้งหมด
                  <br />
                  ที่สามารถทำการซื้อขายได้
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white py-2.5 pl-3 pr-4 text-sm font-medium leading-[22px] text-[#0a6ee7] cursor-pointer"
              >
                <FunnelSimpleIcon size={20} />
                ตัวกรอง
              </button>
            </div>

            {/* Tablet banner — title + button on same row */}
            <div className="hidden w-full flex-wrap content-end items-end gap-4 md:flex lg:hidden">
              <div className="flex min-w-[200px] flex-[1_0_0] flex-col gap-2">
                <p className="text-2xl font-bold leading-9 text-[rgba(0,0,0,0.85)]">
                  All Overseas Bonds
                </p>
                <p className="text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
                  รวม Overseas bonds ทั้งหมด ที่สามารถทำการซื้อขายได้
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex shrink-0 max-w-[343px] items-center gap-1 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white py-2.5 pl-3 pr-4 text-sm font-medium leading-[22px] text-[#0a6ee7] cursor-pointer"
              >
                <FunnelSimpleIcon size={20} />
                ตัวกรอง
              </button>
            </div>
            {filtersOpen && (
              <div className="lg:hidden">
                <AllBondsFilterPanel
                  tickerFilter={tickerFilter}
                  couponFilter={couponFilter}
                  yieldFilter={yieldFilter}
                  maturityFilter={maturityFilter}
                  onTickerChange={setTickerFilter}
                  onCouponChange={setCouponFilter}
                  onYieldChange={setYieldFilter}
                  onMaturityChange={setMaturityFilter}
                  onClear={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                />
              </div>
            )}
            {/* Desktop banner title */}
            <div className="hidden lg:flex w-full flex-col gap-2">
              <p className="text-[32px] font-bold leading-[48px] text-[rgba(0,0,0,0.85)]">
                All Overseas Bonds
              </p>
              <p className="text-base font-semibold leading-6 text-[rgba(0,0,0,0.75)]">
                รวม Overseas bonds ทั้งหมด ที่สามารถทำการซื้อขายได้
              </p>
            </div>
            <div className="hidden w-full flex-nowrap items-center gap-4 lg:flex">
              <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3">
                <FilterDropdown value={tickerFilter} options={TICKER_OPTIONS} onChange={setTickerFilter} />
                <FilterDropdown value={couponFilter} options={COUPON_OPTIONS} onChange={setCouponFilter} />
                <FilterDropdown value={yieldFilter} options={YIELD_OPTIONS} onChange={setYieldFilter} />
                <FilterDropdown value={maturityFilter} options={MATURITY_OPTIONS} onChange={setMaturityFilter} />
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 cursor-pointer rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3.5 py-2 text-sm font-medium leading-[22px] text-[#0a6ee7] whitespace-nowrap"
              >
                ล้างตัวเลือกทั้งหมด
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full items-center md:gap-3 lg:gap-4">
          <div className="flex items-center justify-between w-full gap-3">
            <p className="text-sm font-bold leading-5 text-[#101828] md:text-base md:leading-6">
              จำนวน {displayCount} รายการ
            </p>
            <span className="text-xs leading-4 text-[#6a7282] whitespace-nowrap shrink-0 md:text-sm md:leading-5">
              <span className="md:hidden">อัปเดตล่าสุด {updatedAtMobile}</span>
              <span className="hidden md:inline lg:hidden">อัปเดตล่าสุด {updatedAtTablet}</span>
              <span className="hidden lg:inline">อัปเดตล่าสุด {ALL_OVERSEAS_BONDS_UPDATED_AT}</span>
            </span>
          </div>
          <div className="w-full lg:hidden">
            <AllBondsAccordionList bonds={visibleBonds} />
          </div>
          <div className="hidden w-full lg:block">
            <AllBondsTable bonds={visibleBonds} />
          </div>
          {canLoadMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + ALL_OVERSEAS_BONDS_PAGE_SIZE)}
              className="inline-flex items-center gap-0.5 rounded-md py-1.5 pl-2 pr-2.5 text-sm font-semibold leading-5 text-[#0a6ee7] cursor-pointer"
            >
              <CaretDoubleDownIcon size={18} className="shrink-0" />
              ดูเพิ่มเติม
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
