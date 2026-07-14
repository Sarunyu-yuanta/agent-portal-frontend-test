"use client";

import { useState } from "react";
import {
  CaretDownIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import {
  ALLOCATION_SLICES,
  AllocationBreakdownSidebar,
  HeroCard,
  LastUpdated,
  LiabilitiesBar,
  type AssetAllocationSlice,
  type AssetHeroSummary,
} from "@/components/AssetSummarySection";
import { LiabilitiesDetailModal } from "@/components/LiabilitiesDetailModal";
import {
  DEFAULT_ASSET_ACCOUNTS,
  type AssetAccountItem,
} from "@/data/asset-account-details";
import { getLiabilitiesDetail } from "@/data/liabilities-details";
import { mockClientDetails } from "@/lib/mock-data";
import {
  buildHeroSummaryFromClient,
  formatLiabilitiesStr,
  formatThbAmount,
  parseAmount,
  type ClientSummaryInput,
} from "@/lib/client-utils";
import { ProfitLossBadge } from "@/components/ui/finance-ui";

function AssetAccountCard({
  account,
  onClick,
}: {
  account: AssetAccountItem;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden w-full">
      <button
        type="button"
        className="flex gap-2 items-center p-3 w-full cursor-pointer hover:bg-[var(--bg-default-secondary)] transition-colors text-left"
        onClick={onClick}
      >
        <div className="flex flex-1 gap-2 items-center min-w-0">
          <span className="relative shrink-0 size-2">
            <img
              alt=""
              className="block size-full max-w-none"
              src={account.statusIcon}
            />
          </span>
          <div className="flex flex-1 flex-col items-start min-w-0">
            <p className="type-subtitle-2 text-[var(--text-default-primary)] whitespace-nowrap leading-5 truncate w-full">
              {account.name}
            </p>
            <p className="type-caption text-[var(--text-default-tertiary)] leading-4 truncate w-full">
              {account.accountNo}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex gap-1 items-center text-right whitespace-nowrap">
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] leading-5">
              {account.value}
            </p>
            <p className="type-body-2 text-[var(--text-default-tertiary)] leading-5">THB</p>
          </div>
          {account.avgYield ? (
            <p className="type-caption text-[var(--text-default-tertiary)] leading-4 whitespace-nowrap">
              Avg. Yield: {account.avgYield}%
            </p>
          ) : account.changeAmount && account.changePercent ? (
            <ProfitLossBadge
              changeAmount={account.changeAmount}
              changePercent={account.changePercent}
              changePositive={account.changePositive ?? true}
            />
          ) : null}
        </div>

        <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
      </button>
    </div>
  );
}

export type AssetListViewMode = "product" | "account";

const ASSET_LIST_VIEW_OPTIONS: { id: AssetListViewMode; label: string }[] = [
  { id: "product", label: "By Product" },
  { id: "account", label: "By Account" },
];

function buildProductItems(
  netValue: string,
  slices: AssetAllocationSlice[],
): AssetAccountItem[] {
  const total = parseAmount(netValue);

  return slices
    .filter((slice) => slice.percent > 0)
    .map((slice) => ({
      name: slice.label,
      accountNo: `${slice.percent}%`,
      value: formatThbAmount(total * (slice.percent / 100)),
      changeAmount: "+1,234.00",
      changePercent: "0.05",
      changePositive: true,
      statusIcon: slice.statusIcon,
      ...(slice.label === "ตราสารหนี้" ? { avgYield: "7.32" } : {}),
    }));
}

function AssetListHeader({
  viewMode,
  onViewModeChange,
}: {
  viewMode: AssetListViewMode;
  onViewModeChange: (mode: AssetListViewMode) => void;
}) {
  const selected =
    ASSET_LIST_VIEW_OPTIONS.find((option) => option.id === viewMode) ??
    ASSET_LIST_VIEW_OPTIONS[0];

  return (
    <div className="flex items-center justify-between px-4 w-full">
      <p className="type-subtitle-1 font-bold text-[var(--text-default-primary)] whitespace-nowrap leading-6">
        รายการสินทรัพย์
      </p>
      <div className="relative">
        <select
          value={viewMode}
          onChange={(event) =>
            onViewModeChange(event.target.value as AssetListViewMode)
          }
          aria-label="Filter asset list"
          className="absolute inset-0 z-[1] h-full w-full cursor-pointer opacity-0"
        >
          {ASSET_LIST_VIEW_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-md flex gap-0.5 items-center pl-2 pr-1.5 py-1 pointer-events-none">
          <span className="type-button text-[var(--text-default-primary)] leading-5">
            {selected.label}
          </span>
          <CaretDownIcon size={18} className="text-[var(--text-default-tertiary)] shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ClientAssetSidebarContent({
  clientId,
  client,
  heroSummary,
  liabilities,
  allocationSlices = ALLOCATION_SLICES,
  assetAccounts = DEFAULT_ASSET_ACCOUNTS,
  onItemClick,
}: {
  clientId: string;
  client: ClientSummaryInput;
  heroSummary?: AssetHeroSummary;
  liabilities?: string;
  allocationSlices?: AssetAllocationSlice[];
  assetAccounts?: AssetAccountItem[];
  onItemClick?: (item: AssetAccountItem, viewMode: AssetListViewMode) => void;
}) {
  const [viewMode, setViewMode] = useState<AssetListViewMode>("product");
  const [liabilitiesOpen, setLiabilitiesOpen] = useState(false);
  const detail = mockClientDetails[clientId];
  const summary =
    heroSummary ??
    (detail?.assetSummary
      ? {
          netValue: detail.assetSummary.netValue,
          changeAmount: detail.assetSummary.changeAmount,
          changePercent: detail.assetSummary.changePercent,
          changePositive: detail.assetSummary.changePositive,
          lineAvailable: detail.assetSummary.lineAvailable,
          cash: detail.assetSummary.cash,
          lastUpdatedDate: detail.assetSummary.lastUpdatedDate,
          lastUpdatedTime: detail.assetSummary.lastUpdatedTime,
        }
      : buildHeroSummaryFromClient(client));

  const liabilitiesAmount =
    liabilities ?? formatLiabilitiesStr(client.aum);

  const slices =
    detail?.assetSummary?.allocationSlices ?? allocationSlices;

  const lastUpdatedLabel = `${summary.lastUpdatedDate} - ${summary.lastUpdatedTime}`;
  const liabilitiesDetail = getLiabilitiesDetail(
    liabilitiesAmount,
    lastUpdatedLabel,
  );

  const listItems =
    viewMode === "account"
      ? assetAccounts
      : buildProductItems(summary.netValue, slices);

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-b from-white to-[#f3f4f6]">
          <div className="flex flex-col gap-2 items-center p-4 w-full">
            <HeroCard summary={summary} />
            <LiabilitiesBar
              amount={liabilitiesAmount}
              onClick={() => setLiabilitiesOpen(true)}
            />
            <LastUpdated summary={summary} />
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center py-4 bg-white rounded-t-2xl">
          <AssetListHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <div className="flex flex-col gap-4 items-start px-4 w-full">
            <AllocationBreakdownSidebar slices={slices} />
            <div className="flex flex-col gap-4 w-full">
              {listItems.map((item) => (
                <AssetAccountCard
                  key={`${viewMode}-${item.accountNo}-${item.name}`}
                  account={item}
                  onClick={() => onItemClick?.(item, viewMode)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <LiabilitiesDetailModal
        open={liabilitiesOpen}
        totalAmount={liabilitiesAmount}
        detail={liabilitiesDetail}
        onClose={() => setLiabilitiesOpen(false)}
      />
    </>
  );
}
