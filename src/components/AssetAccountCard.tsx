"use client";

import { useState } from "react";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { ProfitLossBadge } from "@/components/ui/finance-ui";
import {
  getAssetAccountDetail,
  getAssetProductDetail,
  type AssetAccountItem,
} from "@/data/asset-account-details";
import { AssetHoldingAccordion } from "@/components/AssetHoldingRow";

export type AssetListViewMode = "product" | "account";

export function AssetAccountCard({
  account,
  viewMode,
  accordion,
  open: controlledOpen,
  onToggle,
  onClick,
  selected,
}: {
  account: AssetAccountItem;
  viewMode: AssetListViewMode;
  accordion?: boolean;
  open?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  /** Highlights the card as the active selection — used by the desktop
   * list+detail layout, where clicking a row opens its detail in the side
   * panel instead of expanding inline. */
  selected?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggleOpen = onToggle ?? (() => setInternalOpen((p) => !p));
  const detail = accordion
    ? viewMode === "account"
      ? getAssetAccountDetail(account.accountNo)
      : getAssetProductDetail(account.name)
    : null;

  return (
    <div
      className={`bg-white border rounded-lg overflow-hidden w-full transition-colors ${
        selected ? "border-[color:var(--primary-action)]/50" : "border-[rgba(0,0,0,0.1)]"
      }`}
    >
      <button
        type="button"
        className={`flex gap-2 items-center p-3 w-full cursor-pointer transition-colors text-left ${
          selected ? "bg-primary-action-light" : "hover:bg-[var(--bg-default-secondary)]"
        }`}
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
          <CaretRightIcon
            size={20}
            className={`shrink-0 transition-colors ${selected ? "text-primary-action" : "text-[var(--text-default-tertiary)]"}`}
          />
        )}
      </button>

      {accordion && open && detail && <AssetHoldingAccordion detail={detail} />}
    </div>
  );
}

/** Header row shown at the top of the asset detail drawer — icon, name,
 * account number, and value, matching the row that was clicked. */
export function AssetDetailDrawerHeader({ item }: { item: AssetAccountItem }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
      <span className="relative shrink-0 size-2">
        <img alt="" className="block size-full max-w-none" src={item.statusIcon} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] truncate leading-5">
          {item.name}
        </p>
        <p className="type-caption text-[var(--text-default-tertiary)] truncate leading-4">
          {item.accountNo}
        </p>
      </div>
      <div className="flex gap-1 items-center whitespace-nowrap shrink-0">
        <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] leading-5">
          {item.value}
        </p>
        <p className="type-body-2 text-[var(--text-default-tertiary)] leading-5">THB</p>
      </div>
      {/* Reserves space for the drawer's own absolute close button */}
      <div className="w-8 shrink-0" />
    </div>
  );
}
