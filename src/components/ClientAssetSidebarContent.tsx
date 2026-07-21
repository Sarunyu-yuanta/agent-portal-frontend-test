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
import {
  DEFAULT_ASSET_ACCOUNTS,
  getAssetAccountDetail,
  getAssetProductDetail,
  type AssetAccountDetail,
  type AssetAccountItem,
  type HoldingItem,
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

function HoldingItemRow({
  item,
  open,
  onToggle,
}: {
  item: HoldingItem;
  open: boolean;
  onToggle: () => void;
}) {
  const hasPosition = item.position && item.position.fields.length > 0;

  return (
    <div className={`rounded-md overflow-hidden border ${open ? "border-[rgba(0,0,0,0.1)] bg-[var(--bg-default-secondary)]" : "border-transparent"}`}>
      <button
        type="button"
        className={`flex items-center gap-2 py-1.5 w-full text-left transition-colors px-2 ${!open ? "hover:bg-[rgba(0,0,0,0.04)]" : ""}`}
        onClick={() => hasPosition && onToggle()}
        style={{ cursor: hasPosition ? "pointer" : "default" }}
      >
        <div className="flex-1 min-w-0">
          <p className="type-caption font-semibold text-[var(--text-default-primary)] leading-4">
            {item.symbol}
          </p>
          <p className="type-caption text-[var(--text-default-tertiary)] truncate leading-4">
            {item.fullName}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <p className="type-caption font-bold text-[var(--text-default-primary)]">
            {item.value}
          </p>
          <ProfitLossBadge
            changeAmount={item.changeAmount}
            changePercent={item.changePercent}
            changePositive={item.changePositive}
          />
        </div>
        {hasPosition && (
          <CaretDownIcon
            size={14}
            className={`text-[var(--text-default-tertiary)] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && hasPosition && (
        <div className="px-2 pb-2 flex flex-col gap-1">
          {item.position!.fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-2">
              <p className="type-caption text-[var(--text-default-tertiary)] leading-4">{field.label}</p>
              <p className="type-caption font-semibold text-[var(--text-default-primary)] leading-4 shrink-0">{field.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InnerAccordion({ detail }: { detail: AssetAccountDetail }) {
  const allItems = detail.sections.flatMap((s) => s.items);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const allExpanded = allItems.length > 0 && allItems.every((item) => expandedIds.has(item.id));

  const toggleItem = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleExpandCollapseAll = () =>
    setExpandedIds(allExpanded ? new Set() : new Set(allItems.map((i) => i.id)));

  return (
    <div className="border-t border-[rgba(0,0,0,0.06)] divide-y divide-[rgba(0,0,0,0.04)]">
      {detail.sections.map((section, sIdx) => (
        <div key={section.title} className="px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="type-caption font-bold text-[var(--text-default-secondary)] leading-5">
              {section.title}
            </p>
            {sIdx === 0 && (
              <button
                type="button"
                onClick={handleExpandCollapseAll}
                className="type-caption text-primary-action font-medium hover:underline cursor-pointer"
              >
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            )}
          </div>
          {section.items.map((item) => (
            <HoldingItemRow
              key={item.id}
              item={item}
              open={expandedIds.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function AssetAccountCard({
  account,
  viewMode,
  accordion,
  open: controlledOpen,
  onToggle,
  onClick,
}: {
  account: AssetAccountItem;
  viewMode: AssetListViewMode;
  accordion?: boolean;
  open?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggleOpen = onToggle ?? (() => setInternalOpen((p) => !p));
  const detail = accordion
    ? (viewMode === "account"
        ? getAssetAccountDetail(account.accountNo)
        : getAssetProductDetail(account.name))
    : null;

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden w-full">
      <button
        type="button"
        className="flex gap-2 items-center p-3 w-full cursor-pointer hover:bg-[var(--bg-default-secondary)] transition-colors text-left"
        onClick={accordion ? toggleOpen : onClick}
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

        {accordion ? (
          <CaretDownIcon
            size={20}
            className={`text-[var(--text-default-tertiary)] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        ) : (
          <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
        )}
      </button>

      {accordion && open && detail && (
        <InnerAccordion detail={detail} />
      )}
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

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className={`${accordionCards ? "-mx-[9999px] px-[9999px]" : "bg-gradient-to-b from-white to-[#f3f4f6]"}`}>
          <div className={`flex flex-col gap-2 items-center p-4 w-full ${accordionCards ? "max-w-5xl mx-auto" : ""}`}>
            <HeroCard summary={summary} />
            <LiabilitiesBar
              amount={liabilitiesAmount}
              onClick={() => onLiabilitiesOpen?.(liabilitiesAmount, liabilitiesDetail)}
            />
            <LastUpdated summary={summary} />
          </div>
        </div>

        <div className={`flex flex-col gap-4 items-center py-4 bg-white rounded-t-2xl ${accordionCards ? "max-w-2xl mx-auto w-full" : ""}`}>
          <AssetListHeader
            viewMode={viewMode}
            onViewModeChange={(mode) => { setViewMode(mode); setExpandedCards(new Set()); }}
          />
          <div className="flex flex-col gap-4 items-start px-4 w-full">
            <AllocationBreakdownSidebar slices={slices} />
            {accordionCards && (
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  onClick={handleExpandCollapseAll}
                  className="type-caption text-primary-action font-medium hover:underline cursor-pointer"
                >
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
              </div>
            )}
            <div className="flex flex-col gap-4 w-full">
              {listItems.map((item, i) => (
                <AssetAccountCard
                  key={cardKeys[i]}
                  account={item}
                  viewMode={viewMode}
                  accordion={accordionCards}
                  open={accordionCards ? expandedCards.has(cardKeys[i]) : undefined}
                  onToggle={accordionCards ? () => toggleCard(cardKeys[i]) : undefined}
                  onClick={() => onItemClick?.(item, viewMode)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
