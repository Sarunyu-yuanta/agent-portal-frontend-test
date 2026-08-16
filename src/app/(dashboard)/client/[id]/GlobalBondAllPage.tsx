"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Pagination } from "@sarunyu/system-one";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  CaretUpIcon,
  FileTextIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import {
  ALL_OVERSEAS_BONDS,
  ALL_OVERSEAS_BONDS_COUNT,
  ALL_OVERSEAS_BONDS_UPDATED_AT,
  filterAllOverseasBonds,
  type CouponFilter,
  type GlobalBondRow,
  type MaturityFilter,
  type TickerFilter,
  type YieldFilter,
} from "./global-bond-data";
import {
  BORDER_COLOR,
  HEADER_TEXT_CLS,
  TABLE_SHADOW,
  headerBorderStyle,
  cellBorderStyle,
  BondLogo,
  TopPickTag,
  DetailRow,
  FactsheetButton,
  InvestButton,
} from "./fixed-income-shared";

const INVEST_URL = "https://placeholder.example.com/create-order";
const BONDS_COL_MIN_CLS = "min-w-[400px]";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
      <BondLogo src={src} className="size-8 rounded" />
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
  const [prevBonds, setPrevBonds] = useState(bonds);
  if (prevBonds !== bonds) {
    setPrevBonds(bonds);
    setExpandedId(null);
  }

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
  const [isScrolled, setIsScrolled] = useState(false);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

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

  function handleBodyScroll(e: React.UIEvent<HTMLDivElement>) {
    const left = e.currentTarget.scrollLeft;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = left;
    setIsScrolled(left > 0);
  }

  const stickyColCls = `sticky left-0 z-[1] bg-white${isScrolled ? " shadow-[2px_0_4px_rgba(0,0,0,0.06)]" : ""}`;

  return (
    <div
      className="w-full rounded-xl bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW, overflow: "clip" }}
    >
      {/* Sticky header — pinned to the top of the page scroll; its own
          horizontal scroll is hidden and driven programmatically to stay in
          sync with the body below. */}
      <div
        ref={headerScrollRef}
        className="sticky top-0 z-10 overflow-x-hidden bg-white"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-stretch">
          <div className={`flex h-11 shrink-0 items-center w-[400px] ${BONDS_COL_MIN_CLS} px-4 ${stickyColCls}`} style={headerBorderStyle({ left: true })}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Bonds</span>
          </div>
          <div className="flex h-11 shrink-0 items-center w-[138px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ISIN</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-center w-[80px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Currency</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-end w-[128px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Coupon Rate</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-end w-[81px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Price</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-end w-[180px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ผลตอบแทนโดยประมาณ</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-center w-[122px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-end w-[112px] px-4" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ระยะเวลา (ปี)</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-center w-[122px] px-3" style={headerBorderStyle()}>
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>เอกสาร</span>
          </div>
          <div className="flex h-11 shrink-0 items-center justify-center w-[138px] px-4" style={headerBorderStyle({ right: false })} />
        </div>
      </div>

      {/* Scrollable body — the only element that shows a (default-styled)
          native horizontal scrollbar, spanning the full width of the table. */}
      <div
        ref={bodyScrollRef}
        className="overflow-x-scroll [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/25"
        onScroll={handleBodyScroll}
      >
        <div className="flex flex-col">
          {bonds.map((row, i) => {
            const border = cellBorderStyle({ bottom: i === bonds.length - 1 ? false : undefined });
            return (
              <div key={row.id} className="flex items-stretch">
                <div
                  className={`flex items-center gap-2 min-w-0 w-[400px] ${BONDS_COL_MIN_CLS} shrink-0 px-4 py-3.5 h-[65px] overflow-hidden ${stickyColCls}`}
                  style={border}
                >
                  <IssuerLogo src={row.logo} />
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <span className="min-w-0 truncate text-sm leading-5 text-[#101828]">{row.name}</span>
                    {row.topPick && <TopPickTag />}
                  </div>
                </div>
                <div className="flex items-center w-[138px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.isin}</span>
                </div>
                <div className="flex items-center justify-center w-[80px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.currency}</span>
                </div>
                <div className="flex items-center justify-end w-[128px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.couponRate}</span>
                </div>
                <div className="flex items-center justify-end w-[81px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.price}</span>
                </div>
                <div className="flex items-center justify-end w-[180px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.yieldPct}</span>
                </div>
                <div className="flex items-center justify-center w-[122px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.maturity}</span>
                </div>
                <div className="flex items-center justify-end w-[112px] shrink-0 px-4 py-3.5 h-[65px]" style={border}>
                  <span className="text-sm leading-5 text-[#101828]">{row.duration}</span>
                </div>
                <div className="flex items-center justify-center w-[122px] shrink-0 px-3 py-[11px] h-[65px]" style={border}>
                  <FactsheetButton />
                </div>
                <div className="flex items-center justify-center w-[138px] shrink-0 px-4 py-3 h-[65px]" style={border}>
                  <InvestButton href={INVEST_URL} />
                </div>
              </div>
            );
          })}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
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

  const hasActiveFilters =
    tickerFilter !== "all" ||
    couponFilter !== "all" ||
    yieldFilter !== "all" ||
    maturityFilter !== "all";

  const displayCount = hasActiveFilters ? filteredBonds.length : ALL_OVERSEAS_BONDS_COUNT;
  const totalPages = Math.max(1, Math.ceil(filteredBonds.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pagedBonds = useMemo(
    () => filteredBonds.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredBonds, safePage, pageSize],
  );

  const clearFilters = () => {
    setTickerFilter("all");
    setCouponFilter("all");
    setYieldFilter("all");
    setMaturityFilter("all");
    setCurrentPage(1);
  };

  const [prevFilterKey, setPrevFilterKey] = useState({
    tickerFilter,
    couponFilter,
    yieldFilter,
    maturityFilter,
  });
  if (
    prevFilterKey.tickerFilter !== tickerFilter ||
    prevFilterKey.couponFilter !== couponFilter ||
    prevFilterKey.yieldFilter !== yieldFilter ||
    prevFilterKey.maturityFilter !== maturityFilter
  ) {
    setPrevFilterKey({ tickerFilter, couponFilter, yieldFilter, maturityFilter });
    setCurrentPage(1);
  }

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="flex flex-col items-stretch w-full pt-4 pb-10 px-4 md:pt-6 md:pb-20 md:px-8 lg:px-20 bg-gradient-to-b from-white from-[43.451%] to-transparent">
      <div className="flex md:hidden w-full items-center gap-2 border-b border-[rgba(0,0,0,0.1)] -mx-4 px-4 py-3 mb-4">
        <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
          <ArrowLeftIcon size={24} />
        </Button>
        <h1 className="flex-1 min-w-0 text-base font-bold leading-6 text-[#101828] text-center truncate">
          All Overseas Bonds
        </h1>
        <div className="size-6 shrink-0" aria-hidden />
      </div>

      <div className="hidden md:flex gap-2 items-center h-[46px] py-2 w-full max-w-[1280px] mx-auto">
        <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
          <ArrowLeftIcon size={20} />
        </Button>
        <h1 className="flex-1 min-w-0 text-lg font-bold leading-[26px] text-[#101828] truncate">
          All Overseas Bonds
        </h1>
      </div>

      <div className="flex flex-col gap-4 md:gap-8 lg:gap-8 w-full max-w-[1280px] mx-auto">
        <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-xl px-4 py-6 md:gap-6 md:p-8">
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 size-full max-w-none object-cover pointer-events-none rounded-xl"
            src="/global-bond-all-hero.png"
          />
          <div className="relative z-[1] flex w-full flex-col gap-4 md:gap-6">
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
            {/* Desktop banner — title + filters in one block */}
            <div className="hidden lg:flex w-full flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[32px] font-bold leading-[48px] text-[rgba(0,0,0,0.85)]">
                  All Overseas Bonds
                </p>
                <p className="text-base font-semibold leading-6 text-[rgba(0,0,0,0.75)]">
                  รวม Overseas bonds ทั้งหมด ที่สามารถทำการซื้อขายได้
                </p>
              </div>
              <div className="flex w-full flex-nowrap items-center gap-3">
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
        </div>

        <div className="flex flex-col gap-3 w-full items-center lg:gap-4">
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
            <AllBondsAccordionList bonds={pagedBonds} />
          </div>
          <div className="hidden w-full lg:block">
            <AllBondsTable bonds={pagedBonds} />
          </div>
          {filteredBonds.length > 0 && (
            <div className="flex w-full flex-wrap-reverse items-center justify-end gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#6a7282] whitespace-nowrap">Show per page</p>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-[rgba(0,0,0,0.08)] bg-white px-2 py-1 text-xs text-[#101828] cursor-pointer focus:outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-[#6a7282] whitespace-nowrap">
                  Showing{" "}
                  <span className="font-medium text-[#101828]">
                    {(safePage - 1) * pageSize + 1}
                  </span>
                  {" – "}
                  <span className="font-medium text-[#101828]">
                    {Math.min(safePage * pageSize, filteredBonds.length)}
                  </span>
                  {" of "}
                  <span className="font-medium text-[#101828]">{filteredBonds.length}</span>{" "}
                  items
                </p>
                <Pagination totalPages={totalPages} currentPage={safePage} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
