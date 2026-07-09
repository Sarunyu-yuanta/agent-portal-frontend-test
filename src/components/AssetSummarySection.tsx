"use client";

import { useState, type ReactNode } from "react";
import { CaretRightIcon, InfoIcon } from "@phosphor-icons/react";
import { NetValueSummaryModal } from "@/components/NetValueSummaryModal";

export type AssetHeroSummary = {
  netValue: string;
  changeAmount: string;
  changePercent: string;
  changePositive: boolean;
  lineAvailable: string;
  cash: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
};

export type AssetAllocationSlice = {
  label: string;
  percent: number;
  statusIcon: string;
};

export type AssetSummary = AssetHeroSummary & {
  allocationSlices: AssetAllocationSlice[];
};

const DEFAULT_HERO: AssetHeroSummary = {
  netValue: "0.00",
  changeAmount: "+0.00",
  changePercent: "0.00",
  changePositive: true,
  lineAvailable: "0.00",
  cash: "0.00",
  lastUpdatedDate: "—",
  lastUpdatedTime: "—",
};

export const ALLOCATION_SLICES: AssetAllocationSlice[] = [
  { label: "เงินสด", percent: 35, statusIcon: "/asset-allocation/status-0.svg" },
  { label: "หุ้นไทย", percent: 20, statusIcon: "/asset-allocation/status-1.svg" },
  { label: "หุ้นต่างประเทศ", percent: 20, statusIcon: "/asset-allocation/status-2.svg" },
  { label: "หุ้นกู้ที่มีอนุพันธ์แฝง", percent: 10, statusIcon: "/asset-allocation/status-3.svg" },
  { label: "กองทุนรวม", percent: 8, statusIcon: "/asset-allocation/status-4.svg" },
  { label: "ตราสารหนี้", percent: 6, statusIcon: "/asset-allocation/status-5.svg" },
  { label: "อนุพันธ์", percent: 3, statusIcon: "/asset-allocation/status-6.svg" },
  { label: "ตราสารหนี้ต่างประเทศ", percent: 1, statusIcon: "/asset-allocation/status-7.svg" },
];

function AllocationDonutChart() {
  return (
    <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] leading-none place-items-start relative shrink-0">
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute bottom-[22.49%] left-1/2 right-0 top-0">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-cash.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute inset-[69.7%_10.15%_0_36.41%]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-stock.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute inset-[51.07%_60.44%_2.85%_0]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-global.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute bottom-1/2 left-0 right-[76.38%] top-[20.15%]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-structure-note.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute inset-[2.32%_59.36%_79.03%_26.5%]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-bond.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute inset-[0_50.98%_81.77%_37.74%]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-bond1.svg" />
        </div>
      </div>
      <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[96px]">
        <div className="absolute inset-[7.47%_67.04%_71.01%_11.69%]">
          <img alt="" className="block max-w-none size-full" src="/asset-allocation/donut-bond2.svg" />
        </div>
      </div>
    </div>
  );
}

function AllocationLegendItemDesktop({ slice }: { slice: AssetAllocationSlice }) {
  return (
    <div className="flex gap-2 items-center h-[24px] w-[244px] max-w-[244px] min-w-[200px] shrink-0">
      <div className="flex flex-[1_0_0] gap-1 items-center min-w-0 px-2 py-1">
        <span className="relative shrink-0 size-3">
          <img alt="" className="block size-full max-w-none" src={slice.statusIcon} />
        </span>
        <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4">
          {slice.label}
        </p>
      </div>
      <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4 shrink-0">
        {slice.percent}%
      </p>
    </div>
  );
}

function AllocationLegendItemCompact({ slice }: { slice: AssetAllocationSlice }) {
  return (
    <div className="flex gap-2 items-center w-full shrink-0">
      <div className="flex flex-1 gap-1 items-center min-w-0 px-2 py-1">
        <span className="relative shrink-0 size-3">
          <img alt="" className="block size-full max-w-none" src={slice.statusIcon} />
        </span>
        <p className="type-caption text-[var(--text-default-tertiary)] leading-4 truncate">
          {slice.label}
        </p>
      </div>
      <p className="type-caption text-[var(--text-default-tertiary)] leading-4 shrink-0">
        {slice.percent}%
      </p>
    </div>
  );
}

function AllocationBreakdownHeader() {
  return (
    <div className="flex w-full shrink-0 justify-start">
      <p className="type-caption font-semibold text-[var(--text-default-secondary)] whitespace-nowrap leading-4">
        Allocation breakdown
      </p>
    </div>
  );
}

function AllocationBreakdownCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-[rgba(0,0,0,0.1)] rounded-lg flex flex-col gap-3 items-start justify-center p-4 w-full ${className}`}
    >
      {children}
    </div>
  );
}

function AllocationBreakdownDesktop({ slices }: { slices: AssetAllocationSlice[] }) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg flex flex-col gap-3 items-start justify-center p-4 w-full">
      <div className="flex gap-3 items-start justify-center shrink-0 w-full">
        <p className="type-caption font-semibold text-[var(--text-default-secondary)] whitespace-nowrap leading-4 shrink-0">
          Allocation breakdown
        </p>
      </div>
      <div className="flex gap-10 items-center shrink-0 w-full">
        <AllocationDonutChart />
        <div className="flex flex-[1_0_0] flex-wrap content-start gap-x-10 gap-y-2 h-[88px] items-start min-w-0">
          {slices.map((slice) => (
            <AllocationLegendItemDesktop key={slice.label} slice={slice} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AllocationBreakdownMobile({ slices }: { slices: AssetAllocationSlice[] }) {
  return (
    <AllocationBreakdownCard>
      <AllocationBreakdownHeader />
      <div className="flex gap-3 items-center shrink-0 w-full">
        <AllocationDonutChart />
        <div className="flex flex-1 flex-col items-start min-w-0">
          {slices.map((slice) => (
            <AllocationLegendItemCompact key={slice.label} slice={slice} />
          ))}
        </div>
      </div>
    </AllocationBreakdownCard>
  );
}

export function AllocationBreakdownSidebar({
  slices,
}: {
  slices: AssetAllocationSlice[];
}) {
  return (
    <AllocationBreakdownCard>
      <AllocationBreakdownHeader />
      <div className="flex gap-3 items-center shrink-0 w-full">
        <AllocationDonutChart />
        <div className="flex flex-1 flex-col items-start min-w-0">
          {slices.map((slice) => (
            <AllocationLegendItemCompact key={slice.label} slice={slice} />
          ))}
        </div>
      </div>
    </AllocationBreakdownCard>
  );
}

function AllocationBreakdownTablet({ slices }: { slices: AssetAllocationSlice[] }) {
  const midpoint = Math.ceil(slices.length / 2);
  const leftColumn = slices.slice(0, midpoint);
  const rightColumn = slices.slice(midpoint);

  return (
    <AllocationBreakdownCard>
      <AllocationBreakdownHeader />
      <div className="flex gap-6 items-center shrink-0 w-full">
        <AllocationDonutChart />
        <div className="flex flex-1 items-start min-w-0">
          <div className="flex flex-1 flex-col items-start min-w-0">
            {leftColumn.map((slice) => (
              <AllocationLegendItemCompact key={slice.label} slice={slice} />
            ))}
          </div>
          <div className="flex flex-1 flex-col items-start min-w-0">
            {rightColumn.map((slice) => (
              <AllocationLegendItemCompact key={slice.label} slice={slice} />
            ))}
          </div>
        </div>
      </div>
    </AllocationBreakdownCard>
  );
}

export function LiabilitiesBar({
  amount,
  onClick,
}: {
  amount: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg flex items-center gap-2 pl-5 pr-4 py-2 w-full cursor-pointer hover:bg-[var(--bg-default-secondary)] transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-1 gap-0.5 items-center min-w-0">
        <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4 shrink-0">
          Liabilities (THB)
        </p>
        <p className="flex-1 type-body-2 font-bold text-destructive text-right leading-5 min-w-0">
          {amount}
        </p>
      </div>
      <CaretRightIcon size={16} className="text-[var(--text-default-tertiary)] shrink-0" />
    </button>
  );
}

export function HeroCard({ summary }: { summary: AssetHeroSummary }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const changePrefix = summary.changePositive ? "+" : "";

  return (
    <>
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden w-full">
      <div className="flex flex-col items-center py-3 w-full">
        <div className="flex items-start justify-center w-full">
          <div className="flex gap-1 items-center justify-center">
            <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4">
              มูลค่าสุทธิ (THB)
            </p>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="text-[var(--text-default-tertiary)] hover:text-[var(--text-default-secondary)] transition-colors cursor-pointer"
              aria-label="ดูรายละเอียดมูลค่าสุทธิ"
            >
              <InfoIcon size={16} className="shrink-0" />
            </button>
          </div>
        </div>
        <p className="type-h4 text-[var(--text-default-primary)] whitespace-nowrap leading-9">
          {summary.netValue}
        </p>
        <div className="flex gap-1 items-center justify-end">
          <p
            className={`type-caption whitespace-nowrap leading-4 ${
              summary.changePositive ? "text-[var(--text-success-primary)]" : "text-destructive"
            }`}
          >
            {summary.changeAmount}
          </p>
          <div
            className={`flex items-center px-1.5 py-0.5 rounded type-caption leading-4 ${
              summary.changePositive
                ? "bg-[var(--bg-success-soft)] text-[var(--text-success-primary)]"
                : "bg-[var(--bg-danger-light)] text-destructive"
            }`}
          >
            <span>{changePrefix}</span>
            <span>{summary.changePercent}%</span>
          </div>
        </div>
      </div>

      <div className="relative h-px shrink-0 w-full">
        <svg
          className="absolute inset-0 block h-px w-full max-w-none"
          viewBox="0 0 996 1"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <line
            y1="0.5"
            x2="996"
            y2="0.5"
            stroke="black"
            strokeOpacity="0.1"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className="flex items-center w-full">
        <div className="flex flex-[1_0_0] flex-col items-center min-w-0 pt-1.5 pb-3">
          <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4">
            Line Available (THB)
          </p>
          <p className="type-subtitle-1 font-bold text-[var(--text-default-secondary)] whitespace-nowrap leading-6">
            {summary.lineAvailable}
          </p>
        </div>
        <div className="flex flex-[1_0_0] flex-col items-center min-w-0 pt-1.5 pb-3">
          <p className="type-caption text-[var(--text-default-tertiary)] whitespace-nowrap leading-4">
            Cash (THB)
          </p>
          <p className="type-subtitle-1 font-bold text-[var(--text-default-secondary)] whitespace-nowrap leading-6">
            {summary.cash}
          </p>
        </div>
      </div>
    </div>
    <NetValueSummaryModal
      open={infoOpen}
      onClose={() => setInfoOpen(false)}
    />
    </>
  );
}

export function LastUpdated({ summary }: { summary: AssetHeroSummary }) {
  return (
    <div className="flex gap-1 items-center justify-center w-full type-caption text-[var(--text-default-placeholder)] whitespace-nowrap leading-4">
      <span>อัปเดตล่าสุด</span>
      <span>{summary.lastUpdatedDate}</span>
      <span>-</span>
      <span>{summary.lastUpdatedTime}</span>
    </div>
  );
}

export function AssetSummarySection({
  heroSummary,
}: {
  heroSummary?: AssetHeroSummary;
}) {
  const summary = heroSummary ?? DEFAULT_HERO;

  return (
    <section className="flex flex-col w-full">
      <div className="flex flex-col gap-2 items-center w-full max-w-[996px] mx-auto">
        <HeroCard summary={summary} />
        <LastUpdated summary={summary} />

        {/* Mobile allocation */}
        <div className="flex w-full md:hidden">
          <AllocationBreakdownMobile slices={ALLOCATION_SLICES} />
        </div>

        {/* Tablet allocation — 2-column legend (Figma 35473:60752) */}
        <div className="hidden md:flex lg:hidden w-full">
          <AllocationBreakdownTablet slices={ALLOCATION_SLICES} />
        </div>

        {/* Desktop allocation */}
        <div className="hidden lg:flex w-full">
          <AllocationBreakdownDesktop slices={ALLOCATION_SLICES} />
        </div>
      </div>
    </section>
  );
}
