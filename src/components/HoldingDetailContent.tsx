"use client";

import React, { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Tag, useIsMobile } from "@sarunyu/system-one";
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
  expandedIds,
  onToggle,
  isLast = false,
  compactHorizontalPadding = false,
  headerRight,
}: {
  title: string;
  items: HoldingItem[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  isLast?: boolean;
  compactHorizontalPadding?: boolean;
  headerRight?: React.ReactNode;
}) {
  const sectionX = compactHorizontalPadding ? "px-4" : "px-6";

  return (
    <div className="flex flex-col w-full">
      <div className={`flex items-center ${sectionX} py-2 w-full`}>
        <p className="type-caption font-semibold text-[var(--text-default-tertiary)] leading-4 flex-1">
          {title}
        </p>
        {headerRight}
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
            expanded={expandedIds.has(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function HoldingDetailContent({ detail }: { detail: AssetAccountDetail }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const allIds = detail.sections.flatMap((s) => s.items.map((i) => i.id));
  const allExpanded = allIds.length > 0 && allIds.every((id) => expandedIds.has(id));

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(allExpanded ? new Set() : new Set(allIds));
  };

  return (
    <div className="pt-2 pb-6">
      {detail.sections.map((section, index) => (
        <HoldingSectionBlock
          key={section.title}
          title={section.title}
          items={section.items}
          expandedIds={expandedIds}
          onToggle={handleToggle}
          isLast={index === detail.sections.length - 1}
          compactHorizontalPadding={isMobile}
          headerRight={
            index === 0 ? (
              <button
                type="button"
                onClick={handleExpandAll}
                className="type-caption text-primary-action font-medium hover:underline cursor-pointer"
              >
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
