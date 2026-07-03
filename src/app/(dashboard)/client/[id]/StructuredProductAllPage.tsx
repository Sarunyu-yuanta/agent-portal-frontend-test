"use client";

import { useEffect } from "react";
import { Button } from "@sarunyu/system-one";
import { ArrowLeftIcon, CaretDownIcon } from "@phosphor-icons/react";
import { StructuredProductCard } from "./StructuredProductCard";
import {
  ALL_STRUCTURED_PRODUCTS,
  ALL_STRUCTURED_PRODUCTS_COUNT,
  ALL_STRUCTURED_PRODUCTS_UPDATED_AT,
  type StructuredProduct,
} from "./structured-product-data";

const FILTER_CHIPS = ["Coupon", "Type", "Currency", "จำนวน Underlying"] as const;

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] bg-white pl-3 pr-2 py-2 cursor-pointer"
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
    <div className="flex flex-col items-center w-full pt-6 pb-20 bg-gradient-to-b from-white from-[43.451%] to-transparent">
      <div className="flex flex-col gap-6 w-full max-w-[1280px] px-4 md:px-8 lg:px-20">
        {/* Header */}
        <div className="flex gap-2 items-center h-[46px] py-2">
          <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
            <ArrowLeftIcon size={20} />
          </Button>
          <h1 className="flex-1 min-w-0 text-lg font-bold leading-[26px] text-[#101828] truncate">
            Structured Products ทั้งหมด
          </h1>
        </div>

        {/* Hero banner — bg image + text overlay (Figma 34088:538593) */}
        <div className="relative flex h-[144px] w-full flex-col gap-2 items-start overflow-hidden rounded-xl p-8">
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 size-full max-w-none object-cover pointer-events-none rounded-xl"
            src="/structured-products-all-banner-bg.png"
          />
          <p className="relative z-[1] text-[32px] font-bold leading-[48px] text-[rgba(0,0,0,0.85)]">
            All Structured Products
          </p>
          <p className="relative z-[1] text-base font-bold leading-6 text-[rgba(0,0,0,0.75)]">
            รวม Structured Products ทั้งหมด ที่สามารถทำการซื้อขายได้
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map((label) => (
            <FilterChip key={label} label={label} />
          ))}
        </div>

        {/* Product grid */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between w-full text-sm leading-5 text-[#6a7282]">
            <span>จำนวน {ALL_STRUCTURED_PRODUCTS_COUNT} รายการ</span>
            <span className="text-right shrink-0 ml-2">อัปเดตล่าสุด {ALL_STRUCTURED_PRODUCTS_UPDATED_AT}</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {ALL_STRUCTURED_PRODUCTS.map((product) => (
              <StructuredProductCard
                key={product.id}
                {...product}
                variant="grid"
                onClick={() => onProductSelect(product)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
