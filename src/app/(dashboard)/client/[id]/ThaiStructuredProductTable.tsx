"use client";

import { useState } from "react";
import {
  BORDER_COLOR,
  HEADER_TEXT_CLS,
  headerBorderStyle,
  cellBorderStyle,
} from "./fixed-income-shared";
import { THAI_STRUCTURED_PRODUCTS } from "./thai-structured-data";

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
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 12, overflow: "hidden" }}>
      <div
        className="w-full overflow-x-auto"
        onScroll={(e) => setIsScrolled((e.currentTarget as HTMLDivElement).scrollLeft > 0)}
      >
      {/* Header row */}
      <div className="flex h-11 items-stretch shrink-0 min-w-[1290px] bg-white">
        {COLS.map((col, i) => (
          <div
            key={col.key}
            className="flex items-center px-3"
            style={{
              width: col.width,
              flexShrink: 0,
              ...(i === 0
                ? {
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: "white",
                    boxShadow: isScrolled ? "2px 0 4px rgba(0,0,0,0.06)" : undefined,
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    borderRight: `1px solid ${BORDER_COLOR}`,
                  }
                : i === COLS.length - 1
                  ? headerBorderStyle({ right: false })
                  : headerBorderStyle()),
            }}
          >
            <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>{col.label}</span>
          </div>
        ))}
      </div>
      {/* Data rows */}
      {THAI_STRUCTURED_PRODUCTS.map((row, rowIdx) => {
        const rowBg = rowIdx % 2 === 0 ? "white" : "#f9fafb";
        const isLast = rowIdx === THAI_STRUCTURED_PRODUCTS.length - 1;
        return (
          <div
            key={row.theme}
            className="flex items-stretch shrink-0 min-w-[1290px]"
            style={{ backgroundColor: rowBg }}
          >
            {COLS.map((col, i) => {
              const value = col.key === "tenor" ? String(row[col.key]) : row[col.key];
              const isCoupon = col.key === "couponPa";
              return (
                <div
                  key={col.key}
                  className="flex items-center px-3 py-2.5"
                  style={{
                    width: col.width,
                    flexShrink: 0,
                    ...(i === 0
                      ? {
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          backgroundColor: rowBg,
                          boxShadow: isScrolled ? "2px 0 4px rgba(0,0,0,0.06)" : undefined,
                          borderBottom: isLast ? undefined : `1px solid ${BORDER_COLOR}`,
                          borderRight: `1px solid ${BORDER_COLOR}`,
                        }
                      : i === COLS.length - 1
                        ? cellBorderStyle({ bottom: !isLast })
                        : { ...cellBorderStyle({ bottom: !isLast }), borderRight: `1px solid ${BORDER_COLOR}` }),
                  }}
                >
                  <span
                    className="text-sm leading-5 whitespace-nowrap"
                    style={{ color: isCoupon ? "#0a6ee7" : "#101828", fontWeight: isCoupon ? 600 : 400 }}
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
  );
}
