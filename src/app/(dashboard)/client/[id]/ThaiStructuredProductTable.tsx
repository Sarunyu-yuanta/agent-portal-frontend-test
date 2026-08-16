"use client";

import { useState } from "react";
import { Pagination } from "@sarunyu/system-one";
import {
  BORDER_COLOR,
  HEADER_TEXT_CLS,
  SCROLLABLE_TABLE_BODY_CLS,
  TABLE_CARD_STYLE,
  cellBorderStyle,
  headerBorderStyle,
  stickyFirstColStyle,
} from "./fixed-income-shared";
import { useSyncedTableScroll } from "./use-synced-table-scroll";
import { THAI_STRUCTURED_PRODUCTS } from "./thai-structured-data";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const MIN_TABLE_WIDTH = 1290;

const COLS = [
  { key: "theme", label: "Investment Theme", width: 160 },
  { key: "product", label: "Product", width: 80 },
  { key: "ccy", label: "Ccy", width: 70 },
  { key: "bbg1", label: "BBG Code 1", width: 110 },
  { key: "bbg2", label: "BBG Code 2", width: 110 },
  { key: "bbg3", label: "BBG Code 3", width: 110 },
  { key: "couponPa", label: "Coupon p.a. (%)", width: 130 },
  { key: "koType", label: "KO Type", width: 110 },
  { key: "koBarrier", label: "KO Barrier (%)", width: 120 },
  { key: "strike", label: "Strike (%)", width: 100 },
  { key: "kiBarrier", label: "KI Barrier", width: 100 },
  { key: "tenor", label: "Tenor (m)", width: 90 },
] as const;

export function ThaiStructuredProductTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isScrolled, headerScrollRef, bodyScrollRef, onBodyScroll } = useSyncedTableScroll();

  const total = THAI_STRUCTURED_PRODUCTS.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = THAI_STRUCTURED_PRODUCTS.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full rounded-xl bg-white" style={TABLE_CARD_STYLE}>
        {/* Sticky header — pinned below the parent tab bar; its own horizontal
            scroll is hidden and driven by the body below to stay in sync. */}
        <div
          ref={headerScrollRef}
          className="sticky top-[60px] z-20 overflow-x-hidden bg-white rounded-t-xl"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex h-11 items-stretch shrink-0" style={{ minWidth: MIN_TABLE_WIDTH }}>
            {COLS.map((col, i) => {
              const isFirst = i === 0;
              const isLast = i === COLS.length - 1;
              return (
                <div
                  key={col.key}
                  className="flex items-center px-3"
                  style={{
                    width: col.width,
                    flexShrink: 0,
                    ...(isFirst
                      ? { ...stickyFirstColStyle("white", isScrolled), ...headerBorderStyle() }
                      : isLast
                        ? headerBorderStyle({ right: false })
                        : headerBorderStyle()),
                  }}
                >
                  <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={bodyScrollRef} className={SCROLLABLE_TABLE_BODY_CLS} onScroll={onBodyScroll}>
          <div className="flex flex-col" style={{ minWidth: MIN_TABLE_WIDTH }}>
            {paged.map((row, rowIdx) => {
              const rowBg = rowIdx % 2 === 0 ? "white" : "#f9fafb";
              const isLast = rowIdx === paged.length - 1;
              return (
                <div
                  key={row.theme}
                  className="flex items-stretch shrink-0"
                  style={{ backgroundColor: rowBg, minWidth: MIN_TABLE_WIDTH }}
                >
                  {COLS.map((col, i) => {
                    const value = col.key === "tenor" ? String(row[col.key]) : row[col.key];
                    const isCoupon = col.key === "couponPa";
                    const isFirst = i === 0;
                    const cellBorders = i === COLS.length - 1
                      ? cellBorderStyle({ bottom: !isLast })
                      : { ...cellBorderStyle({ bottom: !isLast }), borderRight: `1px solid ${BORDER_COLOR}` };
                    return (
                      <div
                        key={col.key}
                        className="flex items-center px-3 py-2.5"
                        style={{
                          width: col.width,
                          flexShrink: 0,
                          ...(isFirst
                            ? { ...stickyFirstColStyle(rowBg, isScrolled), ...cellBorders }
                            : cellBorders),
                        }}
                      >
                        <span
                          className="text-sm leading-5 whitespace-nowrap"
                          style={{ color: isCoupon ? "#0a6ee7" : "#101828", fontWeight: isCoupon || isFirst ? 600 : 400 }}
                        >
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-wrap-reverse items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[12px] text-muted-foreground whitespace-nowrap">Show per page</p>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-[12px] border border-border rounded-md px-2 py-1 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-action"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[12px] text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(safePage - 1) * pageSize + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min(safePage * pageSize, total)}
            </span>
            {" of "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            items
          </p>
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
