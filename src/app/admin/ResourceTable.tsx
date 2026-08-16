"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@sarunyu/system-one";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  formatCellValue,
  formatColName,
  previewColumns,
  type ApiItem,
  type Resource,
} from "./admin-utils";

type SortDir = "none" | "asc" | "desc";

export function ResourceTable({
  active,
  items,
  search,
  onEdit,
  onDelete,
}: {
  active: Resource;
  items: ApiItem[];
  search: string;
  onEdit: (item: ApiItem) => void;
  onDelete: (id: number | string) => void;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasRightOverflow, setHasRightOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setHasRightOverflow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [items, active]);

  const dirFor = (k: string): SortDir => (sortKey === k ? sortDir : "none");
  const cycleSort = (k: string) => {
    const cur = dirFor(k);
    const next: SortDir = cur === "none" ? "asc" : cur === "asc" ? "desc" : "none";
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
  };

  const sortedItems =
    !sortKey || sortDir === "none"
      ? items
      : [...items].sort((a, b) => {
          const av = a[sortKey] ?? "";
          const bv = b[sortKey] ?? "";
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortDir === "asc" ? cmp : -cmp;
        });

  const filteredItems = !search.trim()
    ? sortedItems
    : sortedItems.filter((item) => {
        const q = search.toLowerCase();
        return Object.values(item).some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        );
      });

  const cols = previewColumns(active.schema);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div ref={scrollRef} className="overflow-x-auto">
        <table className="border-separate border-spacing-0 text-sm whitespace-nowrap min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border w-[52px]">
                #
              </th>
              {cols.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border"
                >
                  <button
                    onClick={() => cycleSort(col)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {formatColName(col)}
                    {dirFor(col) === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : dirFor(col) === "desc" ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th
                className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground border-b border-border w-20 ${
                  hasRightOverflow
                    ? "sticky right-0 bg-gray-50 border-l shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]"
                    : "bg-muted/40"
                }`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length + 2}
                  className="px-4 py-10 text-center text-xs text-muted-foreground"
                >
                  No results for &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`group hover:bg-muted/30 transition-colors ${
                    idx % 2 === 1 ? "bg-muted/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-b border-border w-[52px]">
                    {String(item.id)}
                  </td>
                  {cols.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-3 text-sm text-foreground max-w-[200px] border-b border-border"
                    >
                      <span className="truncate block">
                        {formatCellValue(col, item[col], active.schema)}
                      </span>
                    </td>
                  ))}
                  <td
                    className={`px-4 py-3 border-b border-border transition-colors ${
                      hasRightOverflow
                        ? "sticky right-0 bg-white group-hover:bg-gray-50 border-l shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        variant="plain"
                        size="icon-sm"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="plain"
                        size="icon-sm"
                        onClick={() => onDelete(item.id)}
                        className="text-destructive [&_svg]:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!search && (
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center">
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "record" : "records"}
          </p>
        </div>
      )}
    </div>
  );
}

export function tableFilteredCount(
  items: ApiItem[],
  search: string,
): number {
  if (!search.trim()) return items.length;
  const q = search.toLowerCase();
  return items.filter((item) =>
    Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q)),
  ).length;
}
