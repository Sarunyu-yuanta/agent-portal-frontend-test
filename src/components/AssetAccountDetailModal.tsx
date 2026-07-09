"use client";

import { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Tag, useIsMobile } from "@sarunyu/system-one";
import { ResponsiveBottomSheetModal } from "@/components/ResponsiveBottomSheetModal";
import { ProfitLossBadge, DashedDivider } from "@/components/ui/finance-ui";
import type {
  AssetAccountDetail,
  HoldingItem,
  PositionSummary,
} from "@/data/asset-account-details";

function PositionSummaryPanel({ position }: { position: PositionSummary }) {
  return (
    <div className="flex flex-col gap-2 px-1 pb-1 w-full">
      <p className="type-caption font-semibold text-[var(--text-default-secondary)] leading-4">
        Position summary
      </p>
      <div className="flex flex-wrap gap-2 w-full">
        {position.fields.map((field) => (
          <div
            key={field.label}
            className="flex flex-col h-9 items-start shrink-0 w-[calc(50%-4px)]"
          >
            <p className="type-caption text-[var(--text-default-placeholder)] leading-4 truncate w-full h-4">
              {field.label}
            </p>
            <p className="type-body-2 text-[var(--text-default-primary)] leading-5 w-full">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoldingCard({
  item,
  expanded,
  onToggle,
}: {
  item: HoldingItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const header = (
    <>
      <div className="flex flex-1 flex-col items-end justify-center min-w-0">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex gap-1 items-center min-w-0 self-stretch">
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] leading-5 shrink-0">
              {item.symbol}
            </p>
            {item.collateral && (
              <Tag text="Collateral" variant="blue" size="small" />
            )}
          </div>
          <div className="flex gap-1 items-center text-right whitespace-nowrap shrink-0">
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] leading-5">
              {item.value}
            </p>
            <p className="type-body-2 text-[var(--text-default-tertiary)] leading-5">THB</p>
          </div>
        </div>
        <div className="flex gap-2 items-center w-full">
          <p className="type-caption text-[var(--text-default-tertiary)] leading-4 truncate flex-1 min-w-0">
            {item.fullName}
          </p>
          <ProfitLossBadge
            changeAmount={item.changeAmount}
            changePercent={item.changePercent}
            changePositive={item.changePositive}
          />
        </div>
      </div>
      {expanded ? (
        <CaretUpIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
      ) : (
        <CaretDownIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
      )}
    </>
  );

  if (!expanded) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden w-full">
        <button
          type="button"
          className="flex gap-2 items-center px-3 py-2 w-full cursor-pointer hover:bg-[var(--bg-default-secondary)] transition-colors text-left"
          onClick={onToggle}
          aria-expanded={false}
        >
          {header}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden w-full flex flex-col gap-2 px-3 py-2">
      <button
        type="button"
        className="flex gap-2 items-center w-full cursor-pointer hover:opacity-80 transition-opacity text-left"
        onClick={onToggle}
        aria-expanded
      >
        {header}
      </button>

      {item.position && (
        <>
          <DashedDivider />
          <PositionSummaryPanel position={item.position} />
        </>
      )}
    </div>
  );
}

function HoldingSectionBlock({
  title,
  items,
  expandedId,
  onToggle,
  isLast = false,
  compactHorizontalPadding = false,
}: {
  title: string;
  items: HoldingItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  isLast?: boolean;
  compactHorizontalPadding?: boolean;
}) {
  const sectionX = compactHorizontalPadding ? "px-2" : "px-6";

  return (
    <div className="flex flex-col w-full">
      <div className={`flex items-center ${sectionX} py-2 w-full`}>
        <p className="type-caption font-semibold text-[var(--text-default-tertiary)] leading-4 flex-1">
          {title}
        </p>
      </div>
      <div
        className={`flex flex-col gap-2 items-start ${sectionX} w-full ${
          isLast ? "" : "pb-4"
        }`}
      >
        {items.map((item) => (
          <HoldingCard
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function AssetAccountDetailModal({
  open,
  accountName,
  detail,
  onClose,
}: {
  open: boolean;
  accountName: string;
  detail: AssetAccountDetail;
  onClose: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <ResponsiveBottomSheetModal
      open={open}
      onClose={onClose}
      title="รายการทั้งหมด"
      titleId="asset-account-modal-title"
    >
      <div
        className={`${isMobile ? "px-0" : "px-4"} pb-2 border-b border-[rgba(0,0,0,0.1)] shrink-0`}
      >
        <p className="type-caption text-[var(--text-default-tertiary)] leading-4 truncate">
          {detail.viewByLabel}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-6">
        {detail.sections.map((section, index) => (
          <HoldingSectionBlock
            key={section.title}
            title={section.title}
            items={section.items}
            expandedId={expandedId}
            onToggle={handleToggle}
            isLast={index === detail.sections.length - 1}
            compactHorizontalPadding={isMobile}
          />
        ))}
      </div>
    </ResponsiveBottomSheetModal>
  );
}
