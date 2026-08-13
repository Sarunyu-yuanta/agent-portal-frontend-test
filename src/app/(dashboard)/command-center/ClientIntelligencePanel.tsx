"use client";

import { useState } from "react";
import { Tag, Button, Avatar, Checkbox } from "@sarunyu/system-one";
import {
  SparkleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  PhoneIcon,
  ChatCircleIcon,
  FileTextIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";
import { getInitialsFromWords } from "@/lib/client-utils";
import { clientIntelligenceMap, type NBAActionItem } from "./command-center-data";

const TALKING_POINT_TAG: Record<
  string,
  "green" | "red" | "blue" | "yellow" | "gray"
> = {
  "Portfolio Review": "blue",
  "Product Match": "green",
  Compliance: "red",
  "Re-Engagement": "yellow",
};

export function ClientIntelligencePanel({
  selectedId,
  actions,
  onDismiss,
}: {
  selectedId: string | null;
  actions: NBAActionItem[];
  onDismiss?: (id: string) => void;
}) {
  const { isPrivate } = usePrivacy();
  const action = actions.find((a) => a.id === selectedId) ?? actions[0];
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());

  function togglePoint(i: number) {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  const intel = clientIntelligenceMap[action?.id ?? "1"];
  if (!action || !intel) return null;

  const maskedClientName = maskName(action.clientName, isPrivate);
  const isRevenue = action.revenueImpact.startsWith("฿");
  const initials = getInitialsFromWords(maskedClientName);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials={initials} size="m" />
          <div className="flex-1 min-w-0">
            <p className="type-subtitle-1 text-foreground leading-tight">
              {maskedClientName}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag
                text={action.tier}
                variant={action.tier === "UHNW" ? "blue" : "gray"}
                size="small"
              />
              <Tag text={intel.riskProfile} variant="gray" size="small" />
            </div>
          </div>
          <div className="w-8 shrink-0" />
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <PhoneIcon size={20} />, label: "Call" },
            { icon: <ChatCircleIcon size={20} />, label: "Message" },
            { icon: <FileTextIcon size={20} />, label: "Proposal" },
            { icon: <ClockIcon size={20} />, label: "Snooze" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--bg-default-secondary)] border border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] transition-colors cursor-pointer"
            >
              <span className="text-primary-action">{icon}</span>
              <span className="text-[11px] font-medium text-primary-action leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 px-5 py-5 flex-1 overflow-y-auto bg-[var(--bg-default-secondary)]">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Total Assets",
              value: intel.totalAssets,
              sub: null,
              accent: null,
            },
            {
              label: "Cash Drag",
              value: intel.cashDrag,
              sub: `${intel.cashDragPct}% of portfolio`,
              accent: "text-warning",
            },
            {
              label: "YTD Return",
              value: intel.ytdReturn,
              sub: null,
              accent: intel.ytdPositive ? "text-success" : "text-destructive",
            },
            {
              label: "Risk Profile",
              value: intel.riskProfile,
              sub: null,
              accent: null,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex flex-col justify-between gap-2 p-3 rounded-xl bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] min-h-[80px]"
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                {kpi.label}
              </p>
              <div className="flex flex-col gap-0.5">
                <p
                  className={`type-subtitle-1 font-bold leading-tight ${kpi.accent ?? "text-foreground"}`}
                >
                  {kpi.value}
                </p>
                {kpi.sub && (
                  <p
                    className={`text-[10px] font-semibold leading-none ${kpi.accent ?? "text-muted-foreground"}`}
                  >
                    {kpi.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Behavioral Insight */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              AI Behavioral Insight
            </p>
            <div className="inline-flex items-center gap-1 bg-primary-action/10 rounded-full px-1.5 py-0.5">
              <SparkleIcon
                size={9}
                className="text-primary-action"
                weight="fill"
              />
              <span className="text-[9px] font-bold text-primary-action">
                AI
              </span>
            </div>
          </div>
          <div className="bg-[var(--primary-action-light)] border border-[var(--border-brand-primary)] rounded-xl px-3 py-3 flex flex-col gap-3">
            <p className="text-[12px] text-primary-action leading-relaxed">
              {intel.aiInsight}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                  {isRevenue ? "Est. Revenue" : "Risk"}
                </p>
                <div className="flex items-center gap-1">
                  {isRevenue ? (
                    <>
                      <CurrencyCircleDollarIcon
                        size={13}
                        weight="fill"
                        className="text-success"
                      />
                      <span className="text-[13px] font-bold text-success leading-none">
                        {action.revenueImpact.replace(" est. revenue", "")}
                      </span>
                    </>
                  ) : (
                    <>
                      <WarningCircleIcon
                        size={13}
                        className="text-warning"
                        weight="fill"
                      />
                      <span className="text-[13px] font-bold text-warning leading-none">
                        {action.revenueImpact}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="primary" size="sm">
                {action.action}
              </Button>
            </div>
          </div>
        </div>

        {/* Suggested Talking Points */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Suggested Talking Points
          </p>
          <div className="flex flex-col gap-0.5">
            {intel.talkingPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => togglePoint(i)}
              >
                <div className="mt-0.5 shrink-0">
                  <Checkbox
                    checked={checkedPoints.has(i)}
                    onChange={() => togglePoint(i)}
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-[12px] text-foreground leading-snug">
                    {point.text}
                  </p>
                  <Tag
                    text={point.category}
                    variant={TALKING_POINT_TAG[point.category] ?? "gray"}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-[var(--border-default)] px-5 py-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          leftIcon={<UserIcon size={16} />}
          onClick={() => onDismiss?.(action.id)}
        >
          Dismiss Action
        </Button>
      </div>
    </div>
  );
}
