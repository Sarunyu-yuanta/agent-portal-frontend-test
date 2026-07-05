"use client";

import { useEffect } from "react";
import { Button } from "@sarunyu/system-one";
import { ArrowLeftIcon, CaretDownIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { StructuredProductCard } from "./StructuredProductCard";
import {
  ALL_STRUCTURED_PRODUCTS,
  ALL_STRUCTURED_PRODUCTS_COUNT,
  ALL_STRUCTURED_PRODUCTS_UPDATED_AT,
  ALL_STRUCTURED_PRODUCTS_UPDATED_AT_TABLET,
  type StructuredProduct,
} from "./structured-product-data";

const FILTER_CHIPS = ["Coupon", "Type", "Currency", "จำนวน Underlying"] as const;

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] bg-white pl-2.5 pr-1.5 py-1.5 cursor-pointer"
    >
      <span className="text-xs leading-4 text-[#4a5565] whitespace-nowrap">{label}</span>
      <CaretDownIcon size={16} className="shrink-0 text-[#4a5565]" />
    </button>
  );
}

export function StructuredProductAllPage({
  onBack,
  onProductSelect,
}: {
  onBack: () => void;
  onProductSelect: (product: StructuredProduct) => void;
}) {
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full pt-4 pb-10 md:pt-4 md:pb-10 lg:pt-6 lg:pb-20 bg-gradient-to-b from-white from-[43.451%] to-transparent">
      <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-[1280px] px-4 md:px-8 lg:px-20">
        {/* Header */}
        <div className="flex gap-2 items-center h-[46px] py-2">
          <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
            <ArrowLeftIcon size={20} />
          </Button>
          <h1 className="flex-1 min-w-0 text-lg font-bold leading-[26px] text-[#101828] truncate">
            Structured Products ทั้งหมด
          </h1>
        </div>

        {/* Hero banner — tablet: H4 24px / Subtitle2 14px; desktop: H3 32px / Subtitle1 16px */}
        <div className="relative flex w-full flex-col gap-2 items-start overflow-hidden rounded-xl p-4 lg:h-[144px] lg:p-8">
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 size-full max-w-none object-cover pointer-events-none rounded-xl"
            src="/structured-products-all-banner-bg.png"
          />
          <div className="relative z-[1] flex max-w-[220px] flex-col gap-2 md:max-w-none">
            <p className="text-2xl font-bold leading-9 text-[#101828] lg:text-[32px] lg:leading-[48px] lg:text-[rgba(0,0,0,0.85)]">
              All Structured Products
            </p>
            <p className="text-sm font-bold leading-5 text-[#4a5565] lg:text-base lg:leading-6 lg:text-[rgba(0,0,0,0.75)]">
              รวม Structured Products ทั้งหมด ที่สามารถทำการซื้อขายได้
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map((label) => (
            <FilterChip key={label} label={label} />
          ))}
        </div>

        {/* Product list — mobile/tablet: single-col vertical cards; desktop: 3-col grid */}
        <div className="flex flex-col gap-3 lg:gap-4 w-full">
          <div className="flex items-center justify-between w-full text-xs leading-4 lg:text-sm lg:leading-5 text-[#6a7282]">
            <span>จำนวน {ALL_STRUCTURED_PRODUCTS_COUNT} รายการ</span>
            <span className="text-right shrink-0 ml-2">
              <span className="lg:hidden">อัปเดตล่าสุด {ALL_STRUCTURED_PRODUCTS_UPDATED_AT_TABLET}</span>
              <span className="hidden lg:inline">อัปเดตล่าสุด {ALL_STRUCTURED_PRODUCTS_UPDATED_AT}</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4 w-full">
            {ALL_STRUCTURED_PRODUCTS.map((product) => (
              <StructuredProductCard
                key={product.id}
                {...product}
                variant="catalog"
                onClick={() => onProductSelect(product)}
              />
            ))}
          </div>

          {/* Loading indicator — Figma mobile 33799:163741 */}
          <div className="flex gap-1 items-center justify-center w-full py-2 pl-2.5 pr-3.5 lg:hidden">
            <CircleNotchIcon size={22} className="animate-spin text-black/40" />
            <span className="text-sm font-semibold leading-[22px] text-black/40">กำลังโหลดข้อมูล</span>
          </div>
        </div>
      </div>
    </div>
  );
}
