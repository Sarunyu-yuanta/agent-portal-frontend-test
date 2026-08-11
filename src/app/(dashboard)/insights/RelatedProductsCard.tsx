import Link from "next/link";
import { SparkleIcon } from "@phosphor-icons/react";
import { StructuredProductCard } from "../client/[id]/StructuredProductCard";
import { BOND_LOGOS, type FixedIncomeBond } from "../client/[id]/fixed-income-data";
import { BondLogo } from "../client/[id]/fixed-income-shared";
import type { GlobalBondIssuer } from "../client/[id]/global-bond-data";
import { getRelatedProducts } from "./house-view-data";

const CARD_STYLE = {
  backgroundColor: "white",
  border: "1px solid rgba(0,0,0,0.1)",
  boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
};

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

function StatRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="flex items-center justify-center text-center bg-[#f9fafb] rounded-lg w-full py-1.5">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="flex flex-col gap-0.5 items-center justify-center flex-1 min-w-0 h-full"
          style={i < stats.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.1)" } : {}}
        >
          <p className="text-[9px] leading-[14px] text-[#6a7282] w-full truncate">{s.label}</p>
          <p className="text-[12px] leading-4 font-semibold text-[#4a5565] w-full truncate">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function FixedIncomeRelatedCard({ bond }: { bond: FixedIncomeBond }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl w-full" style={CARD_STYLE}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BondLogo src={BOND_LOGOS[bond.logoIdx]} logoCrop={bond.logoCrop} className="size-8 rounded" />
          <div className="flex flex-col min-w-0">
            <p className="font-bold text-[16px] leading-6 text-[#101828] truncate">{bond.symbol}</p>
            <p className="text-[12px] leading-4 text-[#6a7282] truncate">{bond.companyName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 whitespace-nowrap">
          <p className="font-bold text-[16px] leading-6 text-[#101828]">{bond.ytm}</p>
          <p className="text-[12px] leading-4 text-[#6a7282]">YTM</p>
        </div>
      </div>
      <StatRow
        stats={[
          { label: "Coupon", value: bond.couponRate },
          { label: "Tenor", value: bond.tenor },
          { label: "Rating", value: bond.bondRating },
        ]}
      />
    </div>
  );
}

function GlobalBondRelatedCard({ issuer }: { issuer: GlobalBondIssuer }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl w-full" style={CARD_STYLE}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0 size-8 rounded overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size logo, no responsive sizes needed */}
            <img alt="" className="absolute inset-0 size-full object-cover" src={issuer.logo} />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="font-bold text-[16px] leading-6 text-[#101828] truncate">{issuer.title}</p>
            <p className="text-[12px] leading-4 text-[#6a7282] truncate">{issuer.ticker}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 whitespace-nowrap">
          <p className="font-bold text-[16px] leading-6 text-[#101828]">{issuer.estimatedYield}</p>
          <p className="text-[12px] leading-4 text-[#6a7282]">Est. Yield</p>
        </div>
      </div>
      <StatRow
        stats={[
          { label: "Coupon", value: issuer.couponRateRange },
          { label: "Maturity", value: issuer.maturityRange },
          { label: "Rating", value: issuer.sp },
        ]}
      />
    </div>
  );
}

export function RelatedProductsCard({
  strategy,
  variant = "card",
}: { strategy?: { assetClass?: string }; variant?: "card" | "plain" } = {}) {
  const { structured, fixedIncome, globalBond } = getRelatedProducts(strategy);
  const isEmpty = structured.length === 0 && fixedIncome.length === 0 && globalBond.length === 0;

  return (
    <div
      className={
        variant === "card"
          ? "rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
          : "flex flex-col gap-4"
      }
    >
      <div className="flex items-center gap-2.5">
        <SparkleIcon size={24} weight="fill" className="text-primary-action shrink-0" />
        <p className="type-subtitle-1 font-bold text-foreground">Related Products</p>
      </div>

      {isEmpty ? (
        <p className="text-[13px] text-muted-foreground text-center py-4">ยังไม่มีสินค้าที่เกี่ยวข้องในขณะนี้</p>
      ) : (
        <div className="flex flex-col gap-6">
          {structured.length > 0 && (
            <div className="flex flex-col gap-2">
              <GroupLabel>Global Structured Product</GroupLabel>
              <div className="flex flex-col gap-3">
                {structured.map((product) => (
                  <Link key={product.id} href={`/product-catalog/product/${product.id}`} className="block">
                    <StructuredProductCard {...product} variant="grid" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {fixedIncome.length > 0 && (
            <div className="flex flex-col gap-2">
              <GroupLabel>Fixed Income</GroupLabel>
              <div className="flex flex-col gap-3">
                {fixedIncome.map((bond) => (
                  <Link key={bond.id} href={`/product-catalog/fixed-income/bond/${bond.id}`} className="block">
                    <FixedIncomeRelatedCard bond={bond} />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {globalBond.length > 0 && (
            <div className="flex flex-col gap-2">
              <GroupLabel>Global Bond</GroupLabel>
              <div className="flex flex-col gap-3">
                {globalBond.map((issuer) => (
                  <Link key={issuer.id} href={`/product-catalog/global-bond/${issuer.id}`} className="block">
                    <GlobalBondRelatedCard issuer={issuer} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
