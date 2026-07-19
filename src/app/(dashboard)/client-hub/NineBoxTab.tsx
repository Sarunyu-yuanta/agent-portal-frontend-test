"use client";

import { useState } from "react";
import { Avatar } from "@sarunyu/system-one";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { parseAumToThb } from "@/lib/client-utils";
import { mockClients } from "@/lib/mock-data";

type Client = (typeof mockClients)[number];

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function getAumTier(aumStr: string): 0 | 1 | 2 {
  const m = parseAumToThb(aumStr) / 1_000_000;
  if (m > 500) return 0;
  if (m >= 150) return 1;
  return 2;
}

function getAiTier(score: number): 0 | 1 | 2 {
  if (score > 87) return 2;
  if (score >= 75) return 1;
  return 0;
}

// Heat level 1 (low) → 5 (high), drives color
const CELLS: {
  label: string;
  heat: 1 | 2 | 3 | 4 | 5;
}[][] = [
  [
    { label: "Protect",      heat: 3 },
    { label: "Nurture",      heat: 4 },
    { label: "Prioritize",   heat: 5 },
  ],
  [
    { label: "Re-engage",    heat: 2 },
    { label: "Develop",      heat: 3 },
    { label: "Grow",         heat: 4 },
  ],
  [
    { label: "Monitor",      heat: 1 },
    { label: "Activate",     heat: 2 },
    { label: "Rising Stars", heat: 3 },
  ],
];

const HEAT_STYLES: Record<number, { bg: string; dot: string; count: string; badge: string; badgeText: string }> = {
  5: { bg: "bg-emerald-50 hover:bg-emerald-100/70",  dot: "bg-emerald-500", count: "text-emerald-700", badge: "bg-emerald-500 text-white",       badgeText: "P1" },
  4: { bg: "bg-blue-50 hover:bg-blue-100/70",        dot: "bg-blue-500",    count: "text-blue-700",    badge: "bg-blue-500 text-white",           badgeText: "P1" },
  3: { bg: "bg-sky-50 hover:bg-sky-100/70",          dot: "bg-sky-400",     count: "text-sky-700",     badge: "bg-sky-100 text-sky-700",          badgeText: "P2" },
  2: { bg: "bg-slate-50 hover:bg-slate-100/70",      dot: "bg-slate-400",   count: "text-slate-600",   badge: "bg-slate-100 text-slate-600",      badgeText: "P2" },
  1: { bg: "bg-gray-50 hover:bg-gray-100/70",        dot: "bg-gray-300",    count: "text-gray-400",    badge: "bg-gray-100 text-gray-400",        badgeText: "P3" },
};

const AUM_ROWS = [
  { label: "High",   sub: "> ฿500M" },
  { label: "Medium", sub: "฿150M–500M" },
  { label: "Low",    sub: "< ฿150M" },
];

const AI_COLS = [
  { label: "Low",    sub: "< 75" },
  { label: "Medium", sub: "75–87" },
  { label: "High",   sub: "> 87" },
];

function AvatarStack({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const visible = clients.slice(0, 4);
  const overflow = clients.length - visible.length;
  return (
    <div className="flex items-center">
      {visible.map((c, i) => (
        <div key={c.id} className="ring-2 ring-white rounded-full" style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar type="text" initials={getInitials(c.name)} size="s" />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="size-[28px] rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center"
          style={{ marginLeft: -6 }}
        >
          <span className="text-[10px] font-bold text-gray-500">+{overflow}</span>
        </div>
      )}
    </div>
  );
}

function CellSheet({
  open,
  row,
  col,
  clients,
  onClose,
  onSelectClient,
}: {
  open: boolean;
  row: number;
  col: number;
  clients: Client[];
  onClose: () => void;
  onSelectClient: (c: Client) => void;
}) {
  const cell = CELLS[row]?.[col];
  const style = cell ? HEAT_STYLES[cell.heat] : HEAT_STYLES[1];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal>
      <SheetContent side="right" className="w-full md:w-[380px] md:max-w-[380px] p-0 flex flex-col">
        {cell && (
          <>
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full shrink-0 ${style.dot}`} />
                <p className="type-subtitle-1 font-bold text-foreground">{cell.label}</p>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {style.badgeText}
                </span>
              </div>
              <p className="type-caption text-muted-foreground mt-1 pl-[18px]">
                {AUM_ROWS[row].label} AUM · {AI_COLS[col].label} AI Score
              </p>
              <p className="type-caption text-muted-foreground mt-0.5 pl-[18px]">
                {clients.length} client{clients.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                  <span className="text-3xl">—</span>
                  <p className="type-caption">No clients in this segment</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { onSelectClient(c); onClose(); }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-default-secondary)] transition-colors text-left"
                    >
                      <Avatar type="text" initials={getInitials(c.name)} size="m" />
                      <div className="flex-1 min-w-0">
                        <p className="type-subtitle-2 font-semibold text-foreground truncate">{c.name}</p>
                        <p className="type-caption text-muted-foreground">{c.tier} · {c.id}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="type-caption font-semibold text-foreground">{c.aum}</p>
                        <p className="type-caption text-muted-foreground">AI {c.aiScore}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function NineBoxTab({
  clients,
  onSelectClient,
}: {
  clients: Client[];
  onSelectClient: (c: Client) => void;
}) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  const grid: Client[][][] = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => [] as Client[])
  );
  clients.forEach((c) => {
    grid[getAumTier(c.aum)][getAiTier(c.aiScore)].push(c);
  });

  return (
    <>
      <div className="flex gap-4">
        {/* Y-axis label */}
        <div className="flex items-center justify-center shrink-0 w-5">
          <span
            className="text-[11px] font-semibold text-muted-foreground tracking-[0.15em] uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            AUM
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Row labels + grid */}
          <div className="flex gap-3">
            {/* Row labels */}
            <div className="flex flex-col w-[88px] shrink-0">
              {AUM_ROWS.map((r, i) => (
                <div
                  key={r.label}
                  className="flex-1 flex flex-col justify-center items-end pr-3 gap-0.5"
                  style={{ height: 0, minHeight: 140 }}
                >
                  <p className="text-[13px] font-semibold text-foreground leading-4">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-4 whitespace-nowrap">{r.sub}</p>
                </div>
              ))}
            </div>

            {/* 3×3 grid — gap creates divider lines */}
            <div
              className="flex-1 grid grid-cols-3 grid-rows-3 gap-[1px] rounded-xl overflow-hidden border border-[rgba(0,0,0,0.08)]"
              style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
            >
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                  const cell = CELLS[row][col];
                  const style = HEAT_STYLES[cell.heat];
                  const cellClients = grid[row][col];

                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onClick={() => setSelected({ row, col })}
                      className={`
                        flex flex-col justify-between p-3.5 transition-colors cursor-pointer
                        min-h-[140px] text-left
                        ${style.bg}
                      `}
                    >
                      {/* Top row: dot + label + badge */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`size-2 rounded-full shrink-0 ${style.dot}`} />
                          <p className="text-[12px] font-semibold text-foreground leading-4 truncate">
                            {cell.label}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-3 ${style.badge}`}>
                          {style.badgeText}
                        </span>
                      </div>

                      {/* Count */}
                      <p className={`text-3xl font-bold leading-none tracking-tight ${style.count}`}>
                        {cellClients.length}
                      </p>

                      {/* Avatar stack */}
                      <div className="h-7 flex items-center">
                        <AvatarStack clients={cellClients} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Column labels */}
          <div className="flex gap-3">
            <div className="w-[88px] shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-[1px]">
              {AI_COLS.map(({ label, sub }) => (
                <div key={label} className="text-center py-1">
                  <p className="text-[13px] font-semibold text-foreground leading-4">{label}</p>
                  <p className="text-[11px] text-muted-foreground leading-4">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* X-axis title */}
          <div className="flex gap-3">
            <div className="w-[88px] shrink-0" />
            <p className="flex-1 text-center text-[11px] font-semibold text-muted-foreground tracking-[0.15em] uppercase">
              AI Score
            </p>
          </div>
        </div>
      </div>

      {selected !== null && (
        <CellSheet
          open
          row={selected.row}
          col={selected.col}
          clients={grid[selected.row][selected.col]}
          onClose={() => setSelected(null)}
          onSelectClient={onSelectClient}
        />
      )}
    </>
  );
}
