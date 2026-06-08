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
  Checkbox,
  Avatar,
} from "@sarunyu/system-one";
import {
  PlusIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
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
  "Qualified":    { dot: "var(--bg-brand-primary)", label: "Qualified" },
  "Proposed":     { dot: "var(--bg-brand-secondary)", label: "Proposed" },
  "Under Review": { dot: "var(--bg-warning-primary)", label: "Under Review" },
  "Negotiation":  { dot: "var(--text-warning-primary)", label: "Negotiation" },
  "Closed Won":   { dot: "var(--bg-success-primary)", label: "Closed Won" },
  "Closed Lost":  { dot: "var(--text-default-secondary)", label: "Closed Lost" },
};

const STAGE_ADVANCE: Partial<Record<Stage, { label: string; next: Stage }>> = {
  "Qualified":    { label: "Propose",   next: "Proposed" },
  "Proposed":     { label: "Review",    next: "Under Review" },
  "Under Review": { label: "Negotiate", next: "Negotiation" },
  "Negotiation":  { label: "Mark Won",  next: "Closed Won" },
};

const ADVANCE_CHECKLIST: Partial<Record<Stage, { id: string; label: string }[]>> = {
  "Qualified": [
    { id: "product-match",       label: "ยืนยัน product ตรงกับ risk profile ของลูกค้า" },
    { id: "proposal-ready",      label: "เตรียม term sheet / proposal document เรียบร้อยแล้ว" },
    { id: "meeting-scheduled",   label: "นัดหมายการนำเสนอกับลูกค้าแล้ว" },
  ],
  "Proposed": [
    { id: "sent-to-client",      label: "ส่ง proposal ให้ลูกค้าแล้ว" },
    { id: "client-ack",          label: "ลูกค้ารับทราบและตรวจสอบเอกสาร" },
    { id: "compliance-ok",       label: "ผ่านการตรวจสอบ compliance เบื้องต้น" },
  ],
  "Under Review": [
    { id: "client-feedback",     label: "ได้รับ feedback จากลูกค้าแล้ว" },
    { id: "pricing-reviewed",    label: "ทบทวนราคาและเงื่อนไขเรียบร้อยแล้ว" },
    { id: "internal-approval",   label: "ได้รับ internal approval" },
  ],
  "Negotiation": [
    { id: "terms-agreed",        label: "ตกลงเงื่อนไขสุดท้ายกับลูกค้าแล้ว" },
    { id: "compliance-signoff",  label: "compliance sign-off เรียบร้อย" },
    { id: "contract-signed",     label: "ลูกค้าลงนามสัญญา / subscription form แล้ว" },
  ],
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
    value >= 80 ? "var(--text-success-primary)"
    : value >= 50 ? "var(--text-warning-primary)"
    : "var(--text-danger-primary)";
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

function StageAdvanceModal({
  deal,
  next,
  onConfirm,
  onCancel,
}: {
  deal: Deal;
  next: Stage;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const checklist = ADVANCE_CHECKLIST[deal.stage as Stage] ?? [];
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const doneCount = checked.size;
  const total = checklist.length;
  const allDone = total > 0 && doneCount === total;

  function toggle(id: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const advance = STAGE_ADVANCE[deal.stage as Stage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Modal
        variant="content"
        title="ก่อนไปขั้นตอนถัดไป"
        actionLayout="none"
        onClose={onCancel}
      >
        <div className="flex flex-col gap-4">
          {/* Stage transition */}
          <div className="-mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STAGE_META[deal.stage as Stage]?.dot }} />
            <span className="text-[12px] text-muted-foreground">{deal.stage}</span>
            <ArrowRightIcon size={11} className="text-muted-foreground/30" weight="bold" />
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STAGE_META[next]?.dot }} />
            <span className="text-[12px] font-semibold text-foreground">{next}</span>
          </div>

          {/* Deal summary strip */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5">
            <Avatar type="text" initials={getInitials(deal.client)} size="s" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{deal.client}</p>
              <p className="text-[11px] text-muted-foreground truncate">{deal.dealSize} · {deal.product}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                รายการที่ต้องทำก่อน
              </p>
              <span className={`text-[12px] font-bold tabular-nums transition-colors ${allDone ? "text-success" : "text-muted-foreground"}`}>
                {doneCount} / {total}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${allDone ? "bg-success" : "bg-primary-action"}`}
                style={{ width: `${(doneCount / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-1">
            {checklist.map((item) => {
              const done = checked.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${done ? "bg-success/10" : "hover:bg-muted/60"}`}
                >
                  <Checkbox checked={done} onChange={() => toggle(item.id)} />
                  <p className={`text-[13px] leading-snug flex-1 transition-colors ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Button variant="outline" size="xl" className="flex-1" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="xl"
              className="flex-1"
              disabled={!allDone}
              rightIcon={<ArrowRightIcon size={14} weight="bold" />}
              onClick={onConfirm}
            >
              {advance?.label ?? "Advance"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DealCard({ deal, onAdvanceRequest }: { deal: Deal; onAdvanceRequest: (id: string, next: Stage) => void }) {
  const isClosedWon = deal.stage === "Closed Won";
  const isClosedLost = deal.stage === "Closed Lost";
  const advance = STAGE_ADVANCE[deal.stage as Stage];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-colors duration-150 ${advance ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: hovered ? "var(--bg-default-hover)" : "var(--card)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => advance && onAdvanceRequest(deal.id, advance.next)}
    >
      {/* Top row: avatar + client + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar type="text" initials={getInitials(deal.client)} size="xs" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-snug truncate">{deal.client}</p>
            <p className="text-[11px] text-muted-foreground leading-snug truncate">{deal.product}</p>
          </div>
        </div>
        {deal.stalled && <WarningCircleIcon size={16} weight="fill" className="text-[var(--text-warning-primary)] shrink-0 mt-0.5" />}
        {isClosedWon && <CheckCircleIcon size={16} weight="fill" className="text-[var(--text-success-primary)] shrink-0 mt-0.5" />}
        {isClosedLost && <XCircleIcon size={16} weight="fill" className="text-muted-foreground shrink-0 mt-0.5" />}
      </div>

      {/* Deal size */}
      <p className="type-h6 text-foreground leading-none">{deal.dealSize}</p>

      {/* Days / status */}
      <div className="flex items-center gap-2">
        {deal.stalled ? (
          <span className="text-[11px] font-semibold text-[var(--text-warning-primary)]">Stalled · {deal.daysInStage}d</span>
        ) : isClosedWon ? (
          <span className="text-[11px] font-semibold text-[var(--text-success-primary)]">Won</span>
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
          onClick={(e) => { e.stopPropagation(); onAdvanceRequest(deal.id, advance.next); }}
        >
          {advance.label}
        </Button>
      ) : isClosedLost ? (
        <Button variant="outline" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
          Reopen
        </Button>
      ) : null}
    </div>
  );
}

function KanbanColumn({ stage, deals, dimmed = false, onAdvanceRequest }: {
  stage: Stage;
  deals: Deal[];
  dimmed?: boolean;
  onAdvanceRequest: (id: string, next: Stage) => void;
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
            <DealCard key={deal.id} deal={deal} onAdvanceRequest={onAdvanceRequest} />
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
  const [newProposal, setNewProposal] = useState({ clientName: "", productType: "", dealSize: "" });
  const [deals, setDeals] = useState<Deal[]>(mockPipelineDeals.map(d => ({ ...d })));
  const [advancing, setAdvancing] = useState<{ deal: Deal; next: Stage } | null>(null);

  const activeStages: Stage[] = ["Qualified", "Proposed", "Under Review", "Negotiation"];
  const closedStages: Stage[] = ["Closed Won", "Closed Lost"];
  const allStages = [...activeStages, ...closedStages];

  function handleAdvanceRequest(dealId: string, next: Stage) {
    const deal = deals.find((d) => d.id === dealId);
    if (deal) setAdvancing({ deal, next });
  }

  function handleAdvanceConfirm() {
    if (!advancing) return;
    setDeals((prev) =>
      prev.map((d) => d.id === advancing.deal.id ? { ...d, stage: advancing.next } : d)
    );
    setAdvancing(null);
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
              onAdvanceRequest={handleAdvanceRequest}
            />
          );
        })}
      </div>

      {/* Stage Advance Modal */}
      {advancing && (
        <StageAdvanceModal
          deal={advancing.deal}
          next={advancing.next}
          onConfirm={handleAdvanceConfirm}
          onCancel={() => setAdvancing(null)}
        />
      )}

      {/* New Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Modal
            variant="content"
            title="New Proposal"
            actionLayout="none"
            onClose={() => { setShowModal(false); setNewProposal({ clientName: "", productType: "", dealSize: "" }); }}
          >
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Client Name"
                value={newProposal.clientName}
                onChange={(val) => setNewProposal((p) => ({ ...p, clientName: val }))}
              />
              <Dropdown
                placeholder="Product Type"
                value={newProposal.productType}
                options={[
                  { value: "sn", label: "Structured Note" },
                  { value: "eq", label: "Equity Fund" },
                  { value: "fi", label: "Fixed Income" },
                ]}
                onChange={(val) => setNewProposal((p) => ({ ...p, productType: val as string }))}
              />
              <Input
                placeholder="Deal Size (฿)"
                value={newProposal.dealSize}
                onChange={(val) => setNewProposal((p) => ({ ...p, dealSize: val }))}
              />
              <Button variant="primary" size="xl" className="w-full" onClick={() => { setShowModal(false); setNewProposal({ clientName: "", productType: "", dealSize: "" }); }}>
                Create
              </Button>
              <Button variant="outline" size="xl" className="w-full" onClick={() => { setShowModal(false); setNewProposal({ clientName: "", productType: "", dealSize: "" }); }}>
                Cancel
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
