"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button, SearchInput, TabGroup } from "@sarunyu/system-one";
import { FixedIncomeTab } from "./FixedIncomeTab";
import { FixedIncomeDetail } from "./FixedIncomeDetail";
import { FixedIncomeCompanyDetail } from "./FixedIncomeCompanyDetail";
import type { FixedIncomeBond } from "./fixed-income-data";
import { GlobalBondTab } from "./GlobalBondTab";
import { GlobalBondDetail } from "./GlobalBondDetail";
import { GlobalBondAllPage } from "./GlobalBondAllPage";
import type { GlobalBondIssuerId } from "./global-bond-data";
import { StructuredProductDetail } from "./StructuredProductDetail";
import { StructuredProductAllPage } from "./StructuredProductAllPage";
import { StructuredProductCard } from "./StructuredProductCard";
import { TopIdeaAllPage } from "./TopIdeaAllPage";
import { TopIdeaDetail } from "./TopIdeaDetail";
import { TopIdeaCard } from "./TopIdeaCard";
import { InvestmentSolutionDetail } from "./InvestmentSolutionDetail";
import { TOP_IDEAS, type TopIdeaSector } from "./top-idea-data";
import { useScrollThreshold } from "./use-scroll-threshold";
import {
  TOP_PICKS,
  STRUCTURED_PRODUCTS,
  type StructuredProduct,
} from "./structured-product-data";
import {
  INVESTMENT_SOLUTIONS,
  getInvestmentSolution,
  type InvestmentSolutionId,
} from "./investment-solution-data";
import {
  ShapesIcon,
  CertificateIcon,
  GlobeHemisphereWestIcon,
  ArrowRightIcon,
  FireIcon,
} from "@phosphor-icons/react";
const A = {
  imgSecureIncome: "/invest-secure-income.png",
  imgBalancedGrowth: "/invest-balanced-growth.png",
  imgHighConvBg: "/invest-high-conviction.png",
  recommendBg: "/investment-solution-bg.jpg",
};

const PRODUCT_TABS = [
  {
    id: "structured",
    title: "Structured Product",
    icon: <ShapesIcon size={18} />,
  },
  {
    id: "fixed-income",
    title: "Fixed Income",
    icon: <CertificateIcon size={18} />,
  },
  {
    id: "global-bond",
    title: "Global Bond",
    icon: <GlobeHemisphereWestIcon size={18} />,
  },
];

const PRODUCT_TABS_MOBILE = PRODUCT_TABS.map(({ id, title }) => ({
  id,
  title,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

type CropTransform = { scaleX: number; scaleY: number; tx: number; ty: number };

function InvestmentCard({
  name,
  desc,
  coupon,
  tenor,
  imgSrc,
  gradient,
  imgLeft,
  imgW,
  imgH,
  imgRotation,
  crop,
  onClick,
}: {
  name: string;
  desc: string;
  coupon: string;
  tenor: string;
  imgSrc: string;
  gradient: string;
  imgLeft: number;
  imgW: number;
  imgH: number;
  imgRotation?: number;
  crop?: CropTransform;
  onClick?: () => void;
}) {
  const isHighConviction = imgRotation === 180;
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-xl flex gap-4 p-3 flex-1
        md:flex-none md:w-full md:h-30 md:gap-6 md:px-8 md:py-3
        lg:flex-1 lg:h-auto lg:gap-4 lg:p-3
        items-center${onClick ? " cursor-pointer" : ""}`}
      style={{
        backgroundImage: gradient,
        boxShadow:
          "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)",
      }}
    >
      {/* Secure Income / Balanced Growth: image in fixed container on left */}
      {crop && (
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ width: 72, height: imgH }}
        >
          <img
            alt=""
            className="absolute h-full max-w-none top-0 pointer-events-none"
            style={{
              left: `${((-crop.tx / crop.scaleX) * 100).toFixed(1)}%`,
              width: `${(100 / crop.scaleX).toFixed(1)}%`,
            }}
            src={imgSrc}
          />
        </div>
      )}
      {/* High Conviction: invisible spacer — aligns content with other cards' 72px image slot */}
      {isHighConviction && (
        <div
          className="shrink-0 relative z-10"
          style={{ width: 72 }}
          aria-hidden
        />
      )}
      {/* High Conviction: absolute image behind content */}
      {isHighConviction && (
        <div
          className="absolute z-0 flex items-center justify-center pointer-events-none"
          style={{ left: imgLeft, top: 0, width: imgW, height: imgH }}
        >
          <div style={{ transform: "rotate(180deg)", flexShrink: 0 }}>
            <img
              alt=""
              className="object-cover"
              style={{ width: imgW, height: imgH }}
              src={imgSrc}
            />
          </div>
        </div>
      )}
      {/* Content — mobile/desktop: flex-col; tablet (md): flex-row */}
      <div
        className={`flex flex-col gap-3 items-start min-w-0 flex-1
        ${isHighConviction ? "relative z-10" : ""}
        md:flex-row md:gap-6 md:items-center
        lg:flex-col lg:gap-3 lg:items-start`}
      >
        {/* Name + Desc — mobile/desktop: row with button; tablet: col without button */}
        <div
          className="flex gap-2 items-center shrink-0 w-full
          md:flex-col md:items-start md:gap-0 md:flex-1 md:min-w-0 md:w-auto md:shrink-0
          lg:flex-row lg:gap-2 lg:items-center lg:w-full lg:shrink-0"
        >
          <div className="flex flex-col flex-1 min-w-0 whitespace-nowrap">
            <p
              className="font-bold truncate"
              style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}
            >
              {name}
            </p>
            <p
              className="truncate"
              style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}
            >
              {desc}
            </p>
          </div>
          {/* Mobile + Desktop only button (hidden on tablet) */}
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="ดูรายละเอียด"
            className="md:hidden lg:flex"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <ArrowRightIcon size={16} />
          </Button>
        </div>
        {/* Stats — mobile/desktop: full-width below; tablet: flex-1 beside name */}
        <div
          className="flex gap-4 items-start justify-center shrink-0 w-full
          md:flex-1 md:w-auto md:shrink
          lg:shrink-0 lg:w-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>
              Coupon
            </p>
            <p
              className="font-bold"
              style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}
            >
              {coupon}
            </p>
          </div>
          <div
            style={{
              width: 1,
              alignSelf: "stretch",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>
              Tenor
            </p>
            <p
              className="font-bold"
              style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}
            >
              {tenor}
            </p>
          </div>
        </div>
        {/* Tablet-only button (after stats) */}
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="ดูรายละเอียด"
          className="hidden md:flex lg:hidden shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
}

// ─── Investment Solution gradient backgrounds ────────────────────────────────
const GRAD_SECURE =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23f6f7fb'/><stop offset='1' stop-color='%23c5dbe8'/></radialGradient></defs></svg>\")";
const GRAD_BALANCED =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23ffedfc'/><stop offset='1' stop-color='%23f8d0d8'/></radialGradient></defs></svg>\")";
const GRAD_HIGH_CV =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23e5e3fe'/><stop offset='1' stop-color='%23d5beff'/></radialGradient></defs></svg>\")";

// ─── Main Component ───────────────────────────────────────────────────────────

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "";
    }
  }, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}

export type CatalogNavigation = {
  onProductSelect: (product: StructuredProduct) => void;
  onAllProductsView: () => void;
  onTopIdeaSelect: (sector: TopIdeaSector) => void;
  onAllTopIdeasView: () => void;
  onInvestmentSolutionSelect: (id: InvestmentSolutionId) => void;
  onFixedIncomeBondSelect: (bond: FixedIncomeBond) => void;
  onGlobalBondIssuerSelect: (issuerId: GlobalBondIssuerId) => void;
  onAllGlobalBondsView: () => void;
};

export function ProductCatalogTab({
  searchValue: searchValueProp,
  onSearchChange,
  onDetailViewChange,
  navigation,
}: {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onDetailViewChange?: (isDetail: boolean) => void;
  navigation?: CatalogNavigation;
} = {}) {
  const [activeProductTab, setActiveProductTab] = useState("structured");
  const [selectedFixedIncomeBond, setSelectedFixedIncomeBond] =
    useState<FixedIncomeBond | null>(null);
  const [selectedFixedIncomeCompany, setSelectedFixedIncomeCompany] = useState<
    string | null
  >(null);
  const [fixedIncomeView, setFixedIncomeView] = useState<
    "bond" | "company" | null
  >(null);
  const [selectedGlobalBondIssuer, setSelectedGlobalBondIssuer] =
    useState<GlobalBondIssuerId | null>(null);
  const [showAllGlobalBonds, setShowAllGlobalBonds] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<StructuredProduct | null>(null);
  const [selectedTopIdea, setSelectedTopIdea] = useState<TopIdeaSector | null>(
    null,
  );
  const [selectedInvestmentSolution, setSelectedInvestmentSolution] =
    useState<InvestmentSolutionId | null>(null);
  const [showAllTopIdeas, setShowAllTopIdeas] = useState(false);
  const [showAllStructuredProducts, setShowAllStructuredProducts] =
    useState(false);
  const [globalOrThai, setGlobalOrThai] = useState<"Global" | "Thai">("Global");

  const [searchValueInternal, setSearchValueInternal] = useState("");
  const searchValue = searchValueProp ?? searchValueInternal;
  const setSearchValue = onSearchChange ?? setSearchValueInternal;

  const mobileScrolled = useScrollThreshold();

  const topIdeaDrag = useDragScroll();

  const isDetailView = !!(
    showAllGlobalBonds ||
    selectedGlobalBondIssuer ||
    (fixedIncomeView === "bond" && selectedFixedIncomeBond) ||
    (fixedIncomeView === "company" && selectedFixedIncomeCompany) ||
    selectedProduct ||
    selectedTopIdea ||
    selectedInvestmentSolution ||
    showAllTopIdeas ||
    showAllStructuredProducts
  );

  useEffect(() => {
    onDetailViewChange?.(isDetailView);
  }, [isDetailView, onDetailViewChange]);

  // Unified navigation handlers — use URL-based navigation when provided, else internal state
  const nav = {
    onProductSelect: navigation?.onProductSelect ?? setSelectedProduct,
    onAllProductsView: navigation?.onAllProductsView ?? (() => setShowAllStructuredProducts(true)),
    onTopIdeaSelect: navigation?.onTopIdeaSelect ?? setSelectedTopIdea,
    onAllTopIdeasView: navigation?.onAllTopIdeasView ?? (() => setShowAllTopIdeas(true)),
    onInvestmentSolutionSelect: navigation?.onInvestmentSolutionSelect ?? setSelectedInvestmentSolution,
    onFixedIncomeBondSelect: navigation?.onFixedIncomeBondSelect ?? ((bond: FixedIncomeBond) => {
      setSelectedFixedIncomeBond(bond);
      setFixedIncomeView("bond");
    }),
    onGlobalBondIssuerSelect: navigation?.onGlobalBondIssuerSelect ?? setSelectedGlobalBondIssuer,
    onAllGlobalBondsView: navigation?.onAllGlobalBondsView ?? (() => setShowAllGlobalBonds(true)),
  };

  const resetFixedIncomeNav = () => {
    setSelectedFixedIncomeBond(null);
    setSelectedFixedIncomeCompany(null);
    setFixedIncomeView(null);
  };

  const handleProductTabChange = (id: string) => {
    setActiveProductTab(id);
    setSelectedProduct(null);
    setShowAllTopIdeas(false);
    setSelectedTopIdea(null);
    setSelectedInvestmentSolution(null);
    setShowAllStructuredProducts(false);
    resetFixedIncomeNav();
    setSelectedGlobalBondIssuer(null);
    setShowAllGlobalBonds(false);
  };

  // State-based detail views — only used when URL navigation is not provided (e.g. client pages)
  if (!navigation && showAllGlobalBonds) {
    return (
      <div className="flex flex-col w-full">
        <GlobalBondAllPage onBack={() => setShowAllGlobalBonds(false)} />
      </div>
    );
  }

  if (!navigation && selectedGlobalBondIssuer) {
    return (
      <div className="flex flex-col w-full">
        <GlobalBondDetail
          issuerId={selectedGlobalBondIssuer}
          onBack={() => setSelectedGlobalBondIssuer(null)}
          onIssuerSelect={setSelectedGlobalBondIssuer}
        />
      </div>
    );
  }

  if (!navigation && fixedIncomeView === "bond" && selectedFixedIncomeBond) {
    return (
      <div className="flex flex-col w-full">
        <FixedIncomeDetail
          bond={selectedFixedIncomeBond}
          onBack={() => {
            if (selectedFixedIncomeCompany) {
              setSelectedFixedIncomeBond(null);
              setFixedIncomeView("company");
            } else {
              resetFixedIncomeNav();
            }
          }}
          onCompanySelect={(companyId) => {
            setSelectedFixedIncomeCompany(companyId);
            setFixedIncomeView("company");
          }}
        />
      </div>
    );
  }

  if (!navigation && fixedIncomeView === "company" && selectedFixedIncomeCompany) {
    return (
      <div className="flex flex-col w-full">
        <FixedIncomeCompanyDetail
          companyId={selectedFixedIncomeCompany}
          onBack={() => {
            if (selectedFixedIncomeBond) {
              setSelectedFixedIncomeCompany(null);
              setFixedIncomeView("bond");
            } else {
              resetFixedIncomeNav();
            }
          }}
          onBondSelect={(bond) => {
            setSelectedFixedIncomeBond(bond);
            setFixedIncomeView("bond");
          }}
        />
      </div>
    );
  }

  if (!navigation && selectedProduct) {
    return (
      <div className="flex flex-col w-full">
        <StructuredProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      </div>
    );
  }

  if (!navigation && selectedTopIdea) {
    return (
      <div className="flex flex-col w-full">
        <TopIdeaDetail
          sector={selectedTopIdea}
          onBack={() => setSelectedTopIdea(null)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  if (!navigation && selectedInvestmentSolution) {
    return (
      <div className="flex flex-col w-full">
        <InvestmentSolutionDetail
          solution={getInvestmentSolution(selectedInvestmentSolution)}
          onBack={() => setSelectedInvestmentSolution(null)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  if (!navigation && showAllTopIdeas) {
    return (
      <div className="flex flex-col w-full">
        <TopIdeaAllPage
          onBack={() => setShowAllTopIdeas(false)}
          onSelect={(sector) => setSelectedTopIdea(sector)}
        />
      </div>
    );
  }

  if (!navigation && showAllStructuredProducts) {
    return (
      <div className="flex flex-col w-full">
        <StructuredProductAllPage
          onBack={() => setShowAllStructuredProducts(false)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  return (
    // Root: full-bleed — negative margin + matching width expansion
    <div className="flex flex-col w-full" style={{ backgroundColor: "white" }}>
      {/* ── Mobile: static search (visible only when not scrolled) ── */}
      {!mobileScrolled && (
        <div className="lg:hidden">
          <div
            className="relative shrink-0 w-full"
            style={{ backgroundColor: "#f3f4f6", height: 96 }}
          >
            <div className="absolute left-4 right-4" style={{ top: 24 }}>
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="ค้นหาสินทรัพย์"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile/Tablet: sticky search + tab bar ── */}
      <div
        className="sticky top-0 z-30 flex flex-col lg:hidden"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        {mobileScrolled && (
          <div className="px-4 pt-2 pb-1">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="ค้นหาสินทรัพย์"
              size="sm"
              className="w-full"
            />
          </div>
        )}
        <div
          className="overflow-x-auto"
          style={{
            scrollbarWidth: "none",
            ["--bg-default-primary" as string]: "transparent",
          }}
        >
          <TabGroup
            items={PRODUCT_TABS_MOBILE}
            activeId={activeProductTab}
            onChange={handleProductTabChange}
            size="md"
          />
        </div>
      </div>

      {/* ── Desktop: gradient search section + tab bar with icons ────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center shrink-0 w-full bg-gradient-to-t from-[#f7f7f7] to-white px-6"
        style={{ height: 120, paddingTop: 32, paddingBottom: 24 }}
      >
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="ค้นหาสินทรัพย์"
          className="w-full max-w-[792px]"
        />
      </div>
      <div className="hidden lg:block sticky top-0 z-10 bg-white pt-4">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <TabGroup
            items={PRODUCT_TABS}
            activeId={activeProductTab}
            onChange={handleProductTabChange}
            size="md"
          />
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      {activeProductTab === "fixed-income" && (
        <FixedIncomeTab onBondSelect={nav.onFixedIncomeBondSelect} />
      )}

      {activeProductTab === "global-bond" && (
        <GlobalBondTab
          onIssuerSelect={nav.onGlobalBondIssuerSelect}
          onViewAll={nav.onAllGlobalBondsView}
        />
      )}

      {activeProductTab === "structured" && (
        <div
          className="flex flex-col gap-6 items-center w-full"
          style={{ paddingTop: 24 }}
        >
          {/* ── Recommend 1 — bg-white (Switch + Waiting) ─────────────────────── */}
          <div
            className="flex flex-col items-center shrink-0 w-full"
            style={{ backgroundColor: "white" }}
          >
            <div className="flex flex-col gap-4 items-center shrink-0 w-full max-w-[1280px] mx-auto px-4 lg:px-6">
              {/* Global/Thai + รายการคำสั่ง */}
              <div className="flex gap-4 items-center shrink-0 w-full">
                <div
                  className="flex gap-1 items-center justify-center overflow-hidden flex-1"
                  style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: 40,
                    padding: 6,
                  }}
                >
                  {(["Global", "Thai"] as const).map((option) => {
                    const sel = globalOrThai === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setGlobalOrThai(option)}
                        className="flex items-center justify-center overflow-hidden cursor-pointer transition-all flex-1"
                        style={{
                          borderRadius: 40,
                          padding: 8,
                          backgroundColor: sel ? "white" : "transparent",
                          border: "none",
                          boxShadow: sel
                            ? "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)"
                            : "none",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: "20px",
                            fontWeight: sel ? 700 : 400,
                            color: sel ? "#101828" : "#6a7282",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {option}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recommend 2 — bg-white (Top Idea) ────────────────────────────── */}
          <div
            className="flex flex-col gap-4 items-start shrink-0 w-full"
            style={{
              backgroundColor: "white",
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            {/* Header — with side padding */}
            <div className="flex gap-2 items-center shrink-0 w-full max-w-[1280px] mx-auto px-4 lg:px-6">
              <p
                className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}
              >
                Top idea
              </p>
              <Button
                variant="plain"
                size="sm"
                rightIcon={<ArrowRightIcon size={18} />}
                className="shrink-0"
                onClick={nav.onAllTopIdeasView}
              >
                ทั้งหมด
              </Button>
            </div>
            {/* Scrollable cards — starts aligned with header, overflows right */}
            <div
              ref={topIdeaDrag.ref}
              className="overflow-x-auto w-full pb-3 hide-scrollbar"
              style={{
                scrollbarWidth: "none",
                cursor: "grab",
                paddingLeft: "max(1rem, calc((100% - 1280px) / 2 + 1.5rem))",
              }}
              onMouseDown={topIdeaDrag.onMouseDown}
              onMouseMove={topIdeaDrag.onMouseMove}
              onMouseUp={topIdeaDrag.onMouseUp}
              onMouseLeave={topIdeaDrag.onMouseLeave}
            >
              <div className="flex gap-3.5 min-w-max pr-4 lg:pr-6">
                {TOP_IDEAS.map((idea, i) => (
                  <TopIdeaCard
                    key={i}
                    sector={idea.sector}
                    onClick={() => nav.onTopIdeaSelect(idea.sector)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Investment Solution — no explicit bg + imgRecommend overlay ─────── */}
          <div
            className="relative shrink-0 w-full"
            style={{ paddingTop: 24, paddingBottom: 24 }}
          >
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={A.recommendBg}
            />
            <div className="flex flex-col gap-4 items-start shrink-0 w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-6">
              <p
                className="font-bold relative shrink-0 overflow-hidden text-ellipsis w-full whitespace-nowrap"
                style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}
              >
                Investment Solution
              </p>
              <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
                <div className="flex flex-col lg:flex-row gap-4 shrink-0 w-full">
                  {INVESTMENT_SOLUTIONS.map((solution) => {
                    const isHighConviction = solution.id === "high-conviction";
                    const isBalanced = solution.id === "balanced-growth";
                    return (
                      <InvestmentCard
                        key={solution.id}
                        name={solution.name}
                        desc={solution.desc}
                        coupon={solution.couponRange}
                        tenor={solution.tenor}
                        imgSrc={
                          isHighConviction
                            ? A.imgHighConvBg
                            : isBalanced
                              ? A.imgBalancedGrowth
                              : A.imgSecureIncome
                        }
                        gradient={
                          isHighConviction
                            ? GRAD_HIGH_CV
                            : isBalanced
                              ? GRAD_BALANCED
                              : GRAD_SECURE
                        }
                        imgLeft={isHighConviction ? -67 : 12}
                        imgW={isHighConviction ? 198 : 72}
                        imgH={isHighConviction ? 132 : isBalanced ? 103 : 92}
                        imgRotation={isHighConviction ? 180 : undefined}
                        crop={
                          !isHighConviction
                            ? {
                                scaleX: isBalanced ? 0.7006 : 0.439,
                                scaleY: 1.0,
                                tx: isBalanced ? 0.1464 : 0,
                                ty: 0,
                              }
                            : undefined
                        }
                        onClick={() =>
                          nav.onInvestmentSolutionSelect(solution.id)
                        }
                      />
                    );
                  })}
                </div>
                {/* Customize Underlying — hidden */}
              </div>
            </div>
          </div>

          {/* ── Main Container — bg-white (Top Pick) ─────────────────────────── */}
          <div
            className="w-full"
            style={{
              backgroundColor: "white",
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <div className="flex flex-col gap-4 items-center shrink-0 w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-6">
              <div className="flex gap-1 items-center shrink-0 w-full">
                <FireIcon
                  size={24}
                  weight="fill"
                  color="#f97316"
                  className="shrink-0 md:hidden lg:block"
                />
                <FireIcon
                  size={20}
                  weight="fill"
                  color="#f97316"
                  className="shrink-0 hidden md:block lg:hidden"
                />
                <p
                  className="font-bold overflow-hidden text-ellipsis whitespace-nowrap text-xl leading-[30px] md:text-lg md:leading-6 lg:text-xl lg:leading-[30px]"
                  style={{ color: "#101828" }}
                >
                  Top pick
                </p>
              </div>
              <div className="grid grid-cols-1 md:flex md:flex-col lg:grid lg:grid-cols-3 gap-4 shrink-0 w-full">
                {TOP_PICKS.map((p) => (
                  <StructuredProductCard
                    key={p.id}
                    {...p}
                    onClick={() => nav.onProductSelect(p)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Container — bg-[#f9fafb] (Structured Product) full-bleed ─── */}
          <div
            className="flex flex-col gap-4 items-center relative shrink-0 w-full"
            style={{
              backgroundColor: "#f9fafb",
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {/* Header */}
            <div className="flex gap-2 items-center shrink-0 w-full max-w-[1280px] mx-auto px-4 lg:px-6">
              <p
                className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}
              >
                Structured Product
              </p>
            </div>
            {/* 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 w-full max-w-[1280px] mx-auto px-4 lg:px-6">
              {STRUCTURED_PRODUCTS.map((p) => (
                <StructuredProductCard
                  key={p.id}
                  {...p}
                  onClick={() => nav.onProductSelect(p)}
                />
              ))}
            </div>
            {/* ดูทั้งหมด */}
            <Button
              variant="plain"
              size="sm"
              className="shrink-0"
              onClick={nav.onAllProductsView}
            >
              ดูทั้งหมด
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
