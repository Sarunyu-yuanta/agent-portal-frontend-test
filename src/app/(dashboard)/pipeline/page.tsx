"use client";

import { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Modal,
  Input,
  Dropdown,
  DropdownMultiple,
} from "@sarunyu/system-one";
import {
  PlusIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  ArrowLineRightIcon,
} from "@phosphor-icons/react";
import { mockPipelineDeals } from "@/lib/mock-data";

const STAGES = [
  "Qualified",
  "Proposed",
  "Under Review",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

type Stage = (typeof STAGES)[number];
type Deal = typeof mockPipelineDeals[number];

const STAGE_META: Record<Stage, { dot: string; label: string }> = {
  "Qualified":    { dot: "#6366f1", label: "Qualified" },
  "Proposed":     { dot: "#8b5cf6", label: "Proposed" },
  "Under Review": { dot: "#f59e0b", label: "Under Review" },
  "Negotiation":  { dot: "#f97316", label: "Negotiation" },
  "Closed Won":   { dot: "#22c55e", label: "Closed Won" },
  "Closed Lost":  { dot: "#94a3b8", label: "Closed Lost" },
};

const STAGE_ADVANCE: Partial<Record<Stage, { label: string; next: Stage }>> = {
  "Qualified":    { label: "Propose",   next: "Proposed" },
  "Proposed":     { label: "Review",    next: "Under Review" },
  "Under Review": { label: "Negotiate", next: "Negotiation" },
  "Negotiation":  { label: "Mark Won",  next: "Closed Won" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function parseDealValue(dealSize: string) {
  return parseFloat(dealSize.replace(/[฿,\sM]/g, "")) || 0;
}

function columnTotal(deals: Deal[]) {
  const sum = deals.reduce((acc, d) => acc + parseDealValue(d.dealSize), 0);
  return sum > 0 ? `฿ ${sum}M` : "—";
}

function ProbabilityBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "#22c55e"
    : value >= 50 ? "#f59e0b"
    : "#ef4444";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums w-7 text-right shrink-0" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

function DealCard({ deal, onAdvance }: { deal: Deal; onAdvance: (id: string, next: Stage) => void }) {
  const isClosedWon = deal.stage === "Closed Won";
  const isClosedLost = deal.stage === "Closed Lost";
  const advance = STAGE_ADVANCE[deal.stage as Stage];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-foreground/15 transition-all">
      {/* Top row: avatar + client + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
            style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            {getInitials(deal.client)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-snug truncate">{deal.client}</p>
            <p className="text-[11px] text-muted-foreground leading-snug truncate">{deal.product}</p>
          </div>
        </div>
        {deal.stalled && <WarningCircleIcon size={16} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />}
        {isClosedWon && <CheckCircleIcon size={16} weight="fill" className="text-green-500 shrink-0 mt-0.5" />}
        {isClosedLost && <XCircleIcon size={16} weight="fill" className="text-muted-foreground shrink-0 mt-0.5" />}
      </div>

      {/* Deal size */}
      <p className="type-h6 text-foreground leading-none">{deal.dealSize}</p>

      {/* Days / status */}
      <div className="flex items-center gap-2">
        {deal.stalled ? (
          <span className="text-[11px] font-semibold text-amber-600">Stalled · {deal.daysInStage}d</span>
        ) : isClosedWon ? (
          <span className="text-[11px] font-semibold text-green-600">Won</span>
        ) : isClosedLost ? (
          <span className="text-[11px] text-muted-foreground">Lost</span>
        ) : deal.daysInStage > 0 ? (
          <span className="text-[11px] text-muted-foreground">{deal.daysInStage}d in stage</span>
        ) : null}
      </div>

      {/* Action button */}
      {advance ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          rightIcon={<ArrowRightIcon size={13} weight="bold" />}
          onClick={() => onAdvance(deal.id, advance.next)}
        >
          {advance.label}
        </Button>
      ) : isClosedLost ? (
        <Button variant="outline" size="sm" className="w-full">
          Reopen
        </Button>
      ) : null}
    </div>
  );
}

function KanbanColumn({ stage, deals, dimmed = false, onAdvance }: {
  stage: Stage;
  deals: Deal[];
  dimmed?: boolean;
  onAdvance: (id: string, next: Stage) => void;
}) {
  const meta = STAGE_META[stage];

  return (
    <div className={`flex flex-col min-w-[272px] w-[272px] shrink-0 transition-opacity ${dimmed ? "opacity-50" : ""}`}>
      <div className="flex flex-col rounded-2xl border border-border bg-muted overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
            <p className="text-[13px] font-semibold text-foreground">{meta.label}</p>
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[11px] font-bold text-muted-foreground tabular-nums leading-none">
                {deals.length}
              </span>
            </span>
          </div>
          <p className="text-[12px] font-medium text-muted-foreground tabular-nums">{columnTotal(deals)}</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2.5 p-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onAdvance={onAdvance} />
          ))}
          {deals.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-xl py-10 flex items-center justify-center">
              <p className="text-[12px] text-muted-foreground/60">No deals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [showModal, setShowModal] = useState(false);
  const [deals, setDeals] = useState<Deal[]>(mockPipelineDeals.map(d => ({ ...d })));

  const activeStages: Stage[] = ["Qualified", "Proposed", "Under Review", "Negotiation"];
  const closedStages: Stage[] = ["Closed Won", "Closed Lost"];
  const allStages = [...activeStages, ...closedStages];

  function handleAdvance(dealId: string, next: Stage) {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: next } : d));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {[
          { label: "Total Pipeline Value",  tag: "+8% vs Q1",  tagV: "green" as const, value: "฿ 770M",  sub: "8 active deals" },
          { label: "Weighted Est. Revenue", tag: "+15% vs Q1", tagV: "green" as const, value: "฿ 8.2M",  sub: "Probability-weighted" },
          { label: "Win Rate",              tag: "YTD 2026",   tagV: "blue" as const,  value: "68%",     sub: "Industry avg: 52%" },
          { label: "Avg Deal Cycle",        tag: "+3d vs Q1",  tagV: "red" as const,   value: "18 days", sub: "Target: 15 days" },
        ].map((k) => (
          <Card key={k.label} variant="default" className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="type-caption text-muted-foreground">{k.label}</p>
              <Tag text={k.tag} variant={k.tagV} size="small" />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <p className="type-h3 text-foreground leading-none">{k.value}</p>
              <p className="type-caption text-[var(--text-default-disabled)]">{k.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="w-full sm:w-72">
            <DropdownMultiple
              label="Product Type"
              placeholder="All Products"
              options={[
                { value: "sn", label: "Structured Note" },
                { value: "eq", label: "Equity Fund" },
                { value: "fi", label: "Fixed Income" },
                { value: "reit", label: "REITs" },
                { value: "bond", label: "Bond" },
              ]}
            />
          </div>
          <div className="w-full sm:w-52">
            <Dropdown
              label="Quarter"
              placeholder="All Quarters"
              options={[
                { value: "q2-2026", label: "Q2 2026" },
                { value: "q1-2026", label: "Q1 2026" },
              ]}
            />
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          leftIcon={<PlusIcon size={16} />}
          onClick={() => setShowModal(true)}
        >
          New Proposal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-3">
        {allStages.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const isClosed = stage === "Closed Won" || stage === "Closed Lost";
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={stageDeals}
              dimmed={isClosed}
              onAdvance={handleAdvance}
            />
          );
        })}
      </div>

      {/* New Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Modal
            variant="content"
            title="New Proposal"
            actionLayout="double"
            primaryLabel="Create"
            secondaryLabel="Cancel"
            onPrimaryClick={() => setShowModal(false)}
            onSecondaryClick={() => setShowModal(false)}
            onClose={() => setShowModal(false)}
          >
            <div className="flex flex-col gap-4">
              <Input placeholder="Client Name" value="" onChange={() => {}} />
              <Dropdown
                placeholder="Product Type"
                options={[
                  { value: "sn", label: "Structured Note" },
                  { value: "eq", label: "Equity Fund" },
                  { value: "fi", label: "Fixed Income" },
                ]}
              />
              <Input placeholder="Deal Size (฿)" value="" onChange={() => {}} />
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
