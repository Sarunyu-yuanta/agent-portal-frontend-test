"use client";

import { Tag, Button } from "@sarunyu/system-one";
import {
  SparkleIcon,
  ArrowsClockwiseIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";
import type { NBAActionItem } from "./command-center-data";

const ACTION_CATEGORY: Record<
  string,
  {
    label: string;
    variant: "green" | "red" | "blue" | "yellow" | "gray";
    color: string;
    bg: string;
    Icon: React.ElementType;
  }
> = {
  "Review & Send": {
    label: "Revenue Opportunity",
    variant: "green",
    color: "var(--text-success-primary)",
    bg: "var(--bg-success-light)",
    Icon: CurrencyCircleDollarIcon,
  },
  "Schedule Review": {
    label: "Compliance Risk",
    variant: "red",
    color: "var(--text-danger-primary)",
    bg: "var(--bg-danger-light)",
    Icon: WarningCircleIcon,
  },
  "Pitch Product": {
    label: "Product Match",
    variant: "blue",
    color: "var(--text-brand-primary)",
    bg: "var(--bg-brand-light)",
    Icon: SparkleIcon,
  },
  "Re-engage": {
    label: "Re-Engage",
    variant: "yellow",
    color: "var(--text-warning-primary)",
    bg: "var(--bg-warning-light)",
    Icon: UsersIcon,
  },
};

interface NbaCardProps {
  action: NBAActionItem;
  onDismiss: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isLast?: boolean;
}

function NbaCard({
  action,
  onDismiss,
  isSelected,
  onSelect,
  isLast,
}: NbaCardProps) {
  const { isPrivate } = usePrivacy();
  const maskedClientName = maskName(action.clientName, isPrivate);
  const isRevenue = action.revenueImpact.startsWith("฿");
  const category = ACTION_CATEGORY[action.action] ?? {
    label: action.action,
    variant: "gray" as const,
    color: "var(--text-default-secondary)",
    bg: "var(--bg-default-secondary)",
    Icon: SparkleIcon,
  };
  const {
    color,
    bg,
    Icon,
    label: categoryLabel,
    variant: categoryVariant,
  } = category;

  const revenueLabel = isRevenue ? (
    <span className="text-[11px] font-medium text-success">
      {action.revenueImpact.replace(" est. revenue", "")} potential
    </span>
  ) : (
    <span className="text-[11px] font-medium text-warning">
      {action.revenueImpact}
    </span>
  );

  return (
    <div
      className={`cursor-pointer transition-colors ${isSelected ? "bg-primary-action-light/60" : "hover:bg-muted/40"} ${!isLast ? "border-b border-border" : ""}`}
      onClick={() => onSelect?.(action.id)}
    >
      {/* ── Mobile layout ── */}
      <div className="flex flex-col gap-2 px-4 py-4 lg:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: bg }}
          >
            <Icon size={13} weight="duotone" style={{ color }} />
          </div>
          <Tag text={categoryLabel} variant={categoryVariant} size="small" />
          <Tag
            text={action.tier}
            variant={action.tier === "UHNW" ? "blue" : "gray"}
            size="small"
          />
        </div>
        <p className="text-[14px] font-semibold text-foreground leading-snug">
          {maskedClientName}
        </p>
        <p className="type-body-2 text-muted-foreground leading-snug">
          {action.insight}
        </p>
        <div className="flex gap-2 bg-primary-action-light rounded-lg px-3 py-2.5">
          <SparkleIcon
            size={13}
            className="text-primary-action shrink-0 mt-0.5"
            weight="fill"
          />
          <p className="text-[12px] text-foreground leading-relaxed">
            {action.aiDraft}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag
              text={action.priority}
              variant={action.priorityVariant}
              size="small"
            />
            {revenueLabel}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="plain"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(action.id);
              }}
            >
              Dismiss
            </Button>
            <Button variant="outline" size="sm">
              {action.action}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout (original) ── */}
      <div className="hidden lg:flex items-start gap-4 px-5 py-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: bg }}
        >
          <Icon size={18} weight="duotone" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Tag text={categoryLabel} variant={categoryVariant} size="small" />
            <Tag
              text={action.tier}
              variant={action.tier === "UHNW" ? "blue" : "gray"}
              size="small"
            />
          </div>
          <p className="text-[14px] font-semibold text-foreground leading-snug">
            {maskedClientName}
          </p>
          <p className="type-body-2 text-muted-foreground leading-snug">
            {action.insight}
          </p>
          <div className="flex gap-2 bg-primary-action-light rounded-lg px-3 py-2.5 mt-0.5">
            <SparkleIcon
              size={14}
              className="text-primary-action shrink-0 mt-0.5"
              weight="fill"
            />
            <p className="text-[13px] text-foreground leading-relaxed">
              {action.aiDraft}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 mt-0.5">
            <div className="flex items-center gap-3">
              <Tag
                text={action.priority}
                variant={action.priorityVariant}
                size="small"
              />
              {revenueLabel}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="plain"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(action.id);
                }}
              >
                Dismiss
              </Button>
              <Button variant="outline" size="sm">
                {action.action}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NbaEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <SparkleIcon
        size={40}
        className="text-muted-foreground"
        weight="duotone"
      />
      <p className="type-body-2 text-muted-foreground">
        All caught up — no pending actions.
      </p>
    </div>
  );
}

export function NbaActionQueue({
  actions,
  onDismiss,
  onRefresh,
  selectedId,
  onSelect,
}: {
  actions: NBAActionItem[];
  onDismiss: (id: string) => void;
  onRefresh: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const totalRevenue = actions
    .filter((a) => a.revenueImpact.startsWith("฿"))
    .reduce((sum, a) => {
      const num = parseFloat(a.revenueImpact.replace(/[฿M\s]/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        {/* Title row */}
        <p className="type-subtitle-1 text-foreground">Next Best Actions</p>
        {/* Summary sub-line + refresh button */}
        {actions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="type-caption text-muted-foreground">
              {actions.length} actions pending
            </span>
            {totalRevenue > 0 && (
              <>
                <span className="type-caption text-muted-foreground/40">·</span>
                <span className="type-caption text-success font-semibold">
                  ฿ {totalRevenue.toFixed(1)}M revenue opportunity
                </span>
              </>
            )}
            <span className="flex-1" />
            <Button
              variant="plain"
              size="sm"
              leftIcon={<ArrowsClockwiseIcon size={13} weight="bold" />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {actions.length === 0 ? (
        <NbaEmptyState />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {actions.map((action, i) => (
            <NbaCard
              key={action.id}
              action={action}
              onDismiss={onDismiss}
              isSelected={selectedId === action.id}
              onSelect={onSelect}
              isLast={i === actions.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
