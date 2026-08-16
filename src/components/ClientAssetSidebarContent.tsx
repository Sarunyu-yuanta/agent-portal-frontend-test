"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import {
  ALLOCATION_SLICES,
  AllocationBreakdownSidebar,
  HeroCard,
  LastUpdated,
  LiabilitiesBar,
  type AssetAllocationSlice,
  type AssetHeroSummary,
} from "@/components/AssetSummarySection";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import {
  DEFAULT_ASSET_ACCOUNTS,
  getAssetAccountDetail,
  getAssetProductDetail,
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
import {
  AssetAccountCard,
  AssetDetailDrawerHeader,
  type AssetListViewMode,
} from "@/components/AssetAccountCard";

export type { AssetListViewMode } from "@/components/AssetAccountCard";

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
  accordionCards,
  onItemClick,
  onLiabilitiesOpen,
}: {
  clientId: string;
  client: ClientSummaryInput;
  heroSummary?: AssetHeroSummary;
  liabilities?: string;
  allocationSlices?: AssetAllocationSlice[];
  assetAccounts?: AssetAccountItem[];
  accordionCards?: boolean;
  onItemClick?: (item: AssetAccountItem, viewMode: AssetListViewMode) => void;
  onLiabilitiesOpen?: (amount: string, detail: ReturnType<typeof getLiabilitiesDetail>) => void;
}) {
  const [viewMode, setViewMode] = useState<AssetListViewMode>("product");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  // Desktop list+detail layout (accordionCards): key of the row whose detail
  // is shown in the side panel, or null to show the summary there instead.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const detail = mockClientDetails[clientId];
  const summary = heroSummary ?? detail?.assetSummary ?? buildHeroSummaryFromClient(client);

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

  const cardKeys = listItems.map((item) => `${viewMode}-${item.accountNo}-${item.name}`);
  const allExpanded = cardKeys.length > 0 && cardKeys.every((k) => expandedCards.has(k));

  const toggleCard = (key: string) =>
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const handleExpandCollapseAll = () =>
    setExpandedCards(allExpanded ? new Set() : new Set(cardKeys));

  if (accordionCards) {
    const selectedIndex = cardKeys.findIndex((k) => k === selectedKey);
    const selectedItem = selectedIndex >= 0 ? listItems[selectedIndex] : null;
    const selectedDetail = selectedItem
      ? viewMode === "account"
        ? getAssetAccountDetail(selectedItem.accountNo)
        : getAssetProductDetail(selectedItem.name)
      : null;

    return (
      <div className="w-full">
        {/* Mobile / tablet — stacked, tap-to-expand-inline (no room for a side panel) */}
        <div className="lg:hidden flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <HeroCard summary={summary} />
            <LiabilitiesBar
              amount={liabilitiesAmount}
              onClick={() => onLiabilitiesOpen?.(liabilitiesAmount, liabilitiesDetail)}
            />
            <LastUpdated summary={summary} />
          </div>

          <div className="flex flex-col gap-4 bg-white rounded-2xl border border-border p-3 md:p-4">
            <AssetListHeader
              viewMode={viewMode}
              onViewModeChange={(mode) => { setViewMode(mode); setExpandedCards(new Set()); }}
            />
            <div className="flex flex-col gap-4">
              <AllocationBreakdownSidebar slices={slices} />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExpandCollapseAll}
                  className="type-caption text-primary-action font-medium hover:underline cursor-pointer"
                >
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {listItems.map((item, i) => (
                  <AssetAccountCard
                    key={cardKeys[i]}
                    account={item}
                    viewMode={viewMode}
                    accordion
                    open={expandedCards.has(cardKeys[i])}
                    onToggle={() => toggleCard(cardKeys[i])}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop — list on the left (60%), summary sticky on the right (40%).
            Clicking a row opens its detail in a drawer sliding in from the
            right, so the net-value card up top is never covered. */}
        <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-6 items-start">
          <div className="flex flex-col gap-4 bg-white rounded-2xl border border-border p-4">
            <AssetListHeader
              viewMode={viewMode}
              onViewModeChange={(mode) => { setViewMode(mode); setSelectedKey(null); }}
            />
            <div className="flex flex-col gap-4">
              <AllocationBreakdownSidebar slices={slices} />
              <div className="flex flex-col gap-3">
                {listItems.map((item, i) => (
                  <AssetAccountCard
                    key={cardKeys[i]}
                    account={item}
                    viewMode={viewMode}
                    selected={selectedKey === cardKeys[i]}
                    onClick={() => setSelectedKey(cardKeys[i])}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="sticky top-24 flex flex-col gap-2">
            <HeroCard summary={summary} />
            <LiabilitiesBar
              amount={liabilitiesAmount}
              onClick={() => onLiabilitiesOpen?.(liabilitiesAmount, liabilitiesDetail)}
            />
            <LastUpdated summary={summary} />
          </div>
        </div>

        {/* Asset detail drawer — same right-side drawer style used across the
            dashboard (client / product / nine-box detail drawers). */}
        <DetailDrawer
          size="narrow"
          className="overflow-hidden flex flex-col"
          open={selectedItem !== null}
          onOpenChange={(open) => { if (!open) setSelectedKey(null); }}
        >
          {selectedItem && selectedDetail && (
            <>
              <AssetDetailDrawerHeader item={selectedItem} />
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <HoldingDetailContent detail={selectedDetail} />
              </div>
            </>
          )}
        </DetailDrawer>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-gradient-to-b from-white to-[#f3f4f6]">
        <div className="flex flex-col gap-2 items-center p-4 w-full">
          <HeroCard summary={summary} />
          <LiabilitiesBar
            amount={liabilitiesAmount}
            onClick={() => onLiabilitiesOpen?.(liabilitiesAmount, liabilitiesDetail)}
          />
          <LastUpdated summary={summary} />
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center py-4 bg-white rounded-t-2xl">
        <AssetListHeader
          viewMode={viewMode}
          onViewModeChange={(mode) => { setViewMode(mode); setExpandedCards(new Set()); }}
        />
        <div className="flex flex-col gap-4 items-start px-4 w-full">
          <AllocationBreakdownSidebar slices={slices} />
          <div className="flex flex-col gap-4 w-full">
            {listItems.map((item, i) => (
              <AssetAccountCard
                key={cardKeys[i]}
                account={item}
                viewMode={viewMode}
                accordion={false}
                onClick={() => onItemClick?.(item, viewMode)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
