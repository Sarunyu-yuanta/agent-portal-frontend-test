"use client";

import { useState } from "react";
import { Card, Tag, Button, Avatar, Checkbox } from "@sarunyu/system-one";
import {
  SparkleIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  UsersIcon,
  PhoneIcon,
  ChatCircleIcon,
  FileTextIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { mockNBAActions, mockMiniKanban } from "@/lib/mock-data";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// ─── Types ───────────────────────────────────────────────────────────────────

type KanbanStage = "Idea" | "Pitch" | "Client Review" | "Executed";

const KANBAN_STAGES: KanbanStage[] = [
  "Idea",
  "Pitch",
  "Client Review",
  "Executed",
];

const KANBAN_STAGE_VARIANT: Record<
  KanbanStage,
  "gray" | "blue" | "yellow" | "green"
> = {
  Idea: "gray",
  Pitch: "blue",
  "Client Review": "yellow",
  Executed: "green",
};

const automationLog = [
  {
    id: "a1",
    done: true,
    label: "Morning brief sent to 8 clients",
    time: "07:00",
  },
  {
    id: "a2",
    done: true,
    label: "KYC reminder sent to Malee Pongpipat",
    time: "08:15",
  },
  {
    id: "a3",
    done: false,
    label: "Structured Note pitch scheduled for Nattaporn — 14:00",
    time: "08:30",
  },
  {
    id: "a4",
    done: true,
    label: "AI matched 5 UHNW clients to Structured Note Series 12",
    time: "09:00",
  },
  {
    id: "a5",
    done: false,
    label: "Re-engagement message queued for Wichai Thongkam",
    time: "09:10",
  },
];

// ─── KPI Bar ─────────────────────────────────────────────────────────────────

const kpiItems = [
  {
    label: "Total AUM",
    value: "฿ 2.4B",
    delta: "+8.2% MoM",
    deltaVariant: "green" as const,
    progress: 80,
    target: "Target ฿ 3.0B",
  },
  {
    label: "Net New Money",
    value: "฿ 180M",
    delta: "+22% QoQ",
    deltaVariant: "green" as const,
    progress: 90,
    target: "Target ฿ 200M",
  },
  {
    label: "YTD Revenue",
    value: "฿ 24.2M",
    delta: "81% of target",
    deltaVariant: "yellow" as const,
    progress: 81,
    target: "Target ฿ 30M",
  },
  {
    label: "Proposals",
    value: "8",
    delta: "3 High Priority",
    deltaVariant: "red" as const,
    progress: null,
    target: "Est. ฿ 4.7M AUM",
  },
];

function KpiBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiItems.map((item) => (
        <Card
          key={item.label}
          variant="default"
          className="flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="type-caption text-muted-foreground">{item.label}</p>
            <Tag text={item.delta} variant={item.deltaVariant} size="small" />
          </div>
          <p className="type-h3 text-foreground leading-none">{item.value}</p>
          {item.progress !== null ? (
            <div className="flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-action transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="type-caption text-[var(--text-default-disabled)]">
                {item.target}
              </p>
            </div>
          ) : (
            <p className="type-caption text-[var(--text-default-disabled)]">
              {item.target}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── NBA Row ──────────────────────────────────────────────────────────────────

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
  action: (typeof mockNBAActions)[number];
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
          {action.clientName}
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
            {action.clientName}
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

function NbaActionQueue({
  actions,
  onDismiss,
  onRefresh,
  selectedId,
  onSelect,
}: {
  actions: typeof mockNBAActions;
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

// ─── Client Intelligence Panel ───────────────────────────────────────────────

const clientIntelligenceMap: Record<
  string,
  {
    totalAssets: string;
    cashDrag: string;
    cashDragPct: number;
    ytdReturn: string;
    ytdPositive: boolean;
    riskProfile: string;
    aiInsight: string;
    talkingPoints: { text: string; category: string }[];
  }
> = {
  "1": {
    totalAssets: "฿ 450M",
    cashDrag: "฿ 81M",
    cashDragPct: 18,
    ytdReturn: "+4.2%",
    ytdPositive: true,
    riskProfile: "Aggressive",
    aiInsight:
      "คุณสมชายมีแนวโน้มตัดสินใจลงทุนช่วงเช้า และเปิดรับข้อเสนอหลัง market update ประวัติชี้ว่าให้น้ำหนักกับผลตอบแทนระยะสั้นมากกว่าการกระจายความเสี่ยง",
    talkingPoints: [
      {
        text: "ทบทวนสัดส่วนเงินสด 18% — สูงกว่า target allocation 8pp",
        category: "Portfolio Review",
      },
      {
        text: "เสนอ Structured Note Series 12 อัตราดอก 8.5% p.a., tenor 6 เดือน",
        category: "Product Match",
      },
      {
        text: "เริ่มด้วย market outlook Q3 ก่อนเข้าเรื่อง product",
        category: "Portfolio Review",
      },
    ],
  },
  "2": {
    totalAssets: "฿ 120M",
    cashDrag: "฿ 8M",
    cashDragPct: 7,
    ytdReturn: "-3.1%",
    ytdPositive: false,
    riskProfile: "Moderate",
    aiInsight:
      "คุณมาลีแสดงความกังวลเรื่อง downside risk ช่วง 2 เดือนที่ผ่านมา และมักถามเรื่อง capital protection KYC หมดอายุใน 14 วัน — โอกาสดีในการนัดพบและ rebalance",
    talkingPoints: [
      {
        text: "ต่ออายุ KYC — หมดอายุวันที่ 11 มิ.ย. 2026",
        category: "Compliance",
      },
      {
        text: "ทบทวน YTD P&L -3.1% และแผน rebalance",
        category: "Portfolio Review",
      },
      {
        text: "เสนอ Capital Protection product เพื่อลด downside anxiety",
        category: "Product Match",
      },
    ],
  },
  "3": {
    totalAssets: "฿ 85M",
    cashDrag: "฿ 4M",
    cashDragPct: 5,
    ytdReturn: "+6.8%",
    ytdPositive: true,
    riskProfile: "Moderate-Aggressive",
    aiInsight:
      "คุณนัตถพรเคยลงทุนใน Structured Note ปี 2024 และได้รับผลตอบแทนดี มีแนวโน้ม respond ดีต่อ product ที่มี track record ชัดเจน เหมาะ pitch ผ่าน LINE ช่วง 10:00–11:00",
    talkingPoints: [
      {
        text: "อ้างอิง Structured Note ปี 2024 — return 7.2% p.a.",
        category: "Product Match",
      },
      {
        text: "เสนอ Series 12 พร้อม historical performance",
        category: "Product Match",
      },
      {
        text: "ติดต่อผ่าน LINE ช่วง 10:00–11:00 ตามพฤติกรรมที่ผ่านมา",
        category: "Portfolio Review",
      },
    ],
  },
  "4": {
    totalAssets: "฿ 62M",
    cashDrag: "฿ 10M",
    cashDragPct: 16,
    ytdReturn: "+1.1%",
    ytdPositive: true,
    riskProfile: "Conservative",
    aiInsight:
      "คุณวิชัยไม่มีการเคลื่อนไหวในพอร์ตตั้งแต่ ก.พ. 2026 แต่เคย engage สูงช่วง SET ลด AI ประเมิน 72% ที่เขาจะ respond ต่อ market update หรือ exclusive content",
    talkingPoints: [
      {
        text: "เริ่มด้วย market update ที่ relate กับ portfolio ของเขา",
        category: "Re-Engagement",
      },
      {
        text: "เสนอ exclusive morning brief สำหรับ HNW clients",
        category: "Re-Engagement",
      },
      {
        text: "ทบทวนเงินสด 16% — โอกาสใน money market fund",
        category: "Portfolio Review",
      },
    ],
  },
};

const TALKING_POINT_TAG: Record<
  string,
  "green" | "red" | "blue" | "yellow" | "gray"
> = {
  "Portfolio Review": "blue",
  "Product Match": "green",
  Compliance: "red",
  "Re-Engagement": "yellow",
};

function ClientIntelligencePanel({
  selectedId,
  actions,
  onDismiss,
}: {
  selectedId: string | null;
  actions: typeof mockNBAActions;
  onDismiss?: (id: string) => void;
}) {
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

  const isRevenue = action.revenueImpact.startsWith("฿");
  const initials = getInitials(action.clientName);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials={initials} size="m" />
          <div className="flex-1 min-w-0">
            <p className="type-subtitle-1 text-foreground leading-tight">
              {action.clientName}
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

// ─── AI Product Match ─────────────────────────────────────────────────────────

function AiProductMatch() {
  return (
    <div className="rounded-xl bg-slate-900 dark:bg-slate-800 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SparkleIcon size={16} className="text-yellow-400" weight="fill" />
        <p className="type-subtitle-2 text-white">AI Product Match</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="type-body-2 text-slate-300 leading-snug">
          <span className="text-white font-semibold">
            Structured Note Series 12
          </span>{" "}
          launched today — 8.5% p.a., 6-month tenor.
        </p>
        <p className="type-caption text-slate-400">
          AI matched{" "}
          <span className="text-white font-medium">5 UHNW clients</span> in your
          book.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {["Somchai Rattanakul", "Nattaporn Chaiwong"].map((name, i) => (
          <div
            key={name}
            className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
          >
            <p className="type-caption text-slate-200">{name}</p>
            <span className="text-[11px] font-bold text-green-400">
              {i === 0 ? "94%" : "88%"} match
            </span>
          </div>
        ))}
      </div>
      <Button variant="primary" size="lg">
        Launch Micro-Campaign
      </Button>
    </div>
  );
}

// ─── Pipeline Snapshot ────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<
  KanbanStage,
  { bar: string; dot: string; shortLabel: string }
> = {
  Idea: {
    bar: "bg-slate-300 dark:bg-slate-600",
    dot: "bg-slate-400",
    shortLabel: "Idea",
  },
  Pitch: { bar: "bg-blue-400", dot: "bg-blue-500", shortLabel: "Pitch" },
  "Client Review": {
    bar: "bg-amber-400",
    dot: "bg-amber-500",
    shortLabel: "Review",
  },
  Executed: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    shortLabel: "Closed",
  },
};

function MiniKanban() {
  const stageStats = KANBAN_STAGES.map((stage) => {
    const deals = mockMiniKanban.filter((d) => d.stage === stage);
    const aum = deals.reduce((sum, d) => {
      const m = d.deal.match(/฿([\d.]+)M/);
      return sum + (m ? parseFloat(m[1]) : 0);
    }, 0);
    return { stage: stage as KanbanStage, count: deals.length, aum };
  });

  const maxAum = Math.max(...stageStats.map((s) => s.aum), 1);
  const BAR_MAX_H = 52;

  const sortedDeals = [...mockMiniKanban].sort(
    (a, b) =>
      KANBAN_STAGES.indexOf(a.stage as KanbanStage) -
      KANBAN_STAGES.indexOf(b.stage as KanbanStage),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="type-subtitle-1 text-foreground">Pipeline</p>
          <p className="type-caption text-muted-foreground">
            ฿ 400M · {mockMiniKanban.length} active deals
          </p>
        </div>
        <Button variant="plain" size="sm">
          View All
        </Button>
      </div>

      {/* Stage bar chart — instant visual encoding (Pipedrive pattern) */}
      <div className="flex items-end gap-2">
        {stageStats.map(({ stage, count, aum }, idx) => {
          const cfg = STAGE_CONFIG[stage];
          const barH =
            count > 0
              ? Math.max(Math.round((aum / maxAum) * BAR_MAX_H), 10)
              : 4;
          const isLast = idx === stageStats.length - 1;

          return (
            <div
              key={stage}
              className="flex-1 flex flex-col items-center gap-1.5 relative"
            >
              {/* AUM label above bar */}
              <p
                className={`text-[10px] font-bold leading-none ${count > 0 ? "text-foreground" : "text-transparent"}`}
              >
                ฿{aum}M
              </p>
              {/* Bar container (fixed height so all align to same baseline) */}
              <div
                className="w-full flex flex-col justify-end"
                style={{ height: BAR_MAX_H }}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-all ${count > 0 ? cfg.bar : "bg-muted/40 rounded-[4px]"}`}
                  style={{ height: barH }}
                />
              </div>
              {/* Stage label */}
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none text-center">
                {cfg.shortLabel}
              </p>
              {/* Deal count */}
              <p className="text-[9px] text-muted-foreground leading-none">
                {count === 0 ? "—" : `${count} deal${count > 1 ? "s" : ""}`}
              </p>

              {/* Connecting arrow between bars */}
              {!isLast && (
                <span className="absolute right-[-8px] bottom-[6px] text-[14px] text-muted-foreground/50 select-none leading-none">
                  ›
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-divider)]" />

      {/* Deal list — no stage tag needed, color dot identifies stage */}
      <div className="flex flex-col gap-0.5">
        {sortedDeals.map((item) => {
          const stage = item.stage as KanbanStage;
          const cfg = STAGE_CONFIG[stage];
          const amountMatch = item.deal.match(/฿[\d.]+M/);
          const amount = amountMatch ? amountMatch[0] : "";
          const product = item.deal.replace(/\s*฿[\d.]+M/, "");

          return (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground leading-tight truncate">
                  {item.client}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">
                  {product}
                </p>
              </div>
              <p className="text-[12px] font-bold text-foreground shrink-0">
                {amount}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Automation Log ───────────────────────────────────────────────────────────

function AutomationLog() {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-subtitle-1 text-foreground">Today's Automation</p>
      <div className="flex flex-col">
        {automationLog.map((entry, i) => (
          <div key={entry.id} className="flex gap-3 group">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  entry.done ? "bg-success/15" : "bg-muted"
                }`}
              >
                {entry.done ? (
                  <CheckCircleIcon
                    size={12}
                    className="text-success"
                    weight="fill"
                  />
                ) : (
                  <ClockIcon
                    size={12}
                    className="text-muted-foreground"
                    weight="regular"
                  />
                )}
              </div>
              {i < automationLog.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>
            {/* Content */}
            <div className="pb-3 flex-1 min-w-0">
              <p className="type-body-2 text-foreground leading-snug">
                {entry.label}
              </p>
              <p className="type-caption text-muted-foreground">{entry.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [nbaActions, setNbaActions] = useState(mockNBAActions);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSelectClient(id: string) {
    setSelectedClientId(id);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* KPI Bar */}
        <KpiBar />

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Left — NBA Action Queue */}
          <div className="w-full lg:flex-[3] min-w-0">
            <NbaActionQueue
              actions={nbaActions}
              onDismiss={(id) =>
                setNbaActions((prev) => prev.filter((a) => a.id !== id))
              }
              onRefresh={() => setNbaActions(mockNBAActions)}
              selectedId={selectedClientId}
              onSelect={handleSelectClient}
            />
          </div>

          {/* Right — AI Match + Pipeline + Automation */}
          <div className="w-full lg:flex-[2] min-w-0 flex flex-col gap-5">
            <AiProductMatch />
            <Card variant="default">
              <MiniKanban />
            </Card>
            <Card variant="default">
              <AutomationLog />
            </Card>
          </div>
        </div>
      </div>

      {/* Client Intelligence Drawer */}
      <Sheet
        modal={false}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedClientId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] sm:max-w-[420px] overflow-y-auto p-0"
        >
          <ClientIntelligencePanel
            selectedId={selectedClientId}
            actions={nbaActions}
            onDismiss={(id) => {
              setNbaActions((prev) => prev.filter((a) => a.id !== id));
              setDrawerOpen(false);
              setSelectedClientId(null);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
