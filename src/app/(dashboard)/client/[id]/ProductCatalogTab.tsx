"use client";

import { useState, useRef, useCallback } from "react";
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
import { TOP_PICKS, STRUCTURED_PRODUCTS, type StructuredProduct } from "./structured-product-data";
import {
  INVESTMENT_SOLUTIONS,
  getInvestmentSolution,
  type InvestmentSolutionId,
} from "./investment-solution-data";
import {
  ShapesIcon, CertificateIcon, GlobeHemisphereWestIcon,
  InfoIcon, XIcon, ClockCounterClockwiseIcon, HourglassHighIcon,
  ArrowRightIcon, FunnelSimpleIcon, SparkleIcon, PhoneIcon,
  FireIcon,
} from "@phosphor-icons/react";
const A = {
  // UI icons
  magnifyingGlass: "https://www.figma.com/api/mcp/asset/2f89682b-fdc1-4045-9041-572aaabfc626",
  infoFill: "https://www.figma.com/api/mcp/asset/a298a2c1-417e-404e-947c-2d573d56a438",
  closeX: "https://www.figma.com/api/mcp/asset/d41bed6e-2d74-4bd9-8454-5d6117e31004",
  hourglassHigh: "https://www.figma.com/api/mcp/asset/57ccec5b-3a0a-4dab-a4d9-90d077aa7e1f",
  arrowRight: "https://www.figma.com/api/mcp/asset/ba1e0039-95d0-4ce2-ba86-26e3a1c5d612",
  arrowRightSm: "https://www.figma.com/api/mcp/asset/bd7d1b7f-8d11-4c2e-b017-c2295410cd1e",
  orderListIcon: "https://www.figma.com/api/mcp/asset/67d60e44-f9e4-4782-9dc7-2d97ae6f4992",
  filterIcon: "https://www.figma.com/api/mcp/asset/75721d74-1d76-4a21-b3d4-b44777a09bea",
  sparkle: "https://www.figma.com/api/mcp/asset/3ab94ca8-803f-4683-a15e-ff0de3868bec",
  phoneIcon: "https://www.figma.com/api/mcp/asset/242c59cf-4099-444d-866e-03b11b663717",
  fire: "https://www.figma.com/api/mcp/asset/7781fa1c-d4b1-4f18-9bb1-c7944ceef4e7",
  fireSmall: "https://www.figma.com/api/mcp/asset/c5622f0d-2de9-4890-b0ce-442d75f90b13",
  shieldCheck: "https://www.figma.com/api/mcp/asset/c2c3aab0-bfd1-4eea-ad52-036428770223",
  lineDivider: "https://www.figma.com/api/mcp/asset/2986753b-4895-4381-8a8d-f3a50d3bf169",
  // Investment Solution (local files — stable, never expire)
  imgSecureIncome: "/invest-secure-income.png",
  imgBalancedGrowth: "/invest-balanced-growth.png",
  imgHighConvBg: "/invest-high-conviction.png",
  recommendBg: "/investment-solution-bg.jpg",
  // Stock logos
  logoKO: "https://www.figma.com/api/mcp/asset/35aeb96b-04ba-45b4-ab74-c4efce9975bc",
  logoWMT: "https://www.figma.com/api/mcp/asset/f2d38797-fa49-4638-80aa-b2fd40baa5b3",
  logoAAPL: "https://www.figma.com/api/mcp/asset/3e3f247c-9e5f-4d73-889b-8e2ac39c6775",
  logoAMZN: "https://www.figma.com/api/mcp/asset/a03ed961-2640-4be3-a716-a7f8c88bab32",
  logoNFLX: "https://www.figma.com/api/mcp/asset/96c3fbf3-e9b9-456c-b58e-5e8de310848b",
  logoSAWAD: "https://www.figma.com/api/mcp/asset/bfc79ad4-d98a-43be-8f21-7c985bdf5f50",
  logoPTT: "https://www.figma.com/api/mcp/asset/66f9ced5-92fa-4ac4-92b8-0987267234ed",
  logoNasdaq: "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
  logoNVDA: "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
  logoAXP: "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
};

const PRODUCT_TABS = [
  { id: "structured", title: "Structured Product", icon: <ShapesIcon size={18} /> },
  { id: "fixed-income", title: "Fixed Income", icon: <CertificateIcon size={18} /> },
  { id: "global-bond", title: "Global Bond", icon: <GlobeHemisphereWestIcon size={18} /> },
];

const PRODUCT_TABS_MOBILE = [
  { id: "structured", title: "Structured Product" },
  { id: "fixed-income", title: "Fixed Income" },
  { id: "global-bond", title: "Global Bond" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

type CropTransform = { scaleX: number; scaleY: number; tx: number; ty: number };

function InvestmentCard({ name, desc, coupon, tenor, imgSrc, gradient, imgLeft, imgW, imgH, imgRotation, crop, onClick }: {
  name: string; desc: string; coupon: string; tenor: string;
  imgSrc: string; gradient: string;
  imgLeft: number; imgW: number; imgH: number;
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
      style={{ backgroundImage: gradient, boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)" }}
    >
      {/* Secure Income / Balanced Growth: image in fixed container on left */}
      {crop && (
        <div className="relative shrink-0 overflow-hidden" style={{ width: 72, height: imgH }}>
          <img
            alt="" className="absolute h-full max-w-none top-0 pointer-events-none"
            style={{
              left: `${(-crop.tx / crop.scaleX * 100).toFixed(1)}%`,
              width: `${(100 / crop.scaleX).toFixed(1)}%`,
            }}
            src={imgSrc}
          />
        </div>
      )}
      {/* High Conviction: invisible spacer — aligns content with other cards' 72px image slot */}
      {isHighConviction && (
        <div className="shrink-0 relative z-10" style={{ width: 72 }} aria-hidden />
      )}
      {/* High Conviction: absolute image behind content */}
      {isHighConviction && (
        <div className="absolute z-0 flex items-center justify-center pointer-events-none"
          style={{ left: imgLeft, top: 0, width: imgW, height: imgH }}
        >
          <div style={{ transform: "rotate(180deg)", flexShrink: 0 }}>
            <img alt="" className="object-cover" style={{ width: imgW, height: imgH }} src={imgSrc} />
          </div>
        </div>
      )}
      {/* Content — mobile/desktop: flex-col; tablet (md): flex-row */}
      <div className={`flex flex-col gap-3 items-start min-w-0 flex-1
        ${isHighConviction ? "relative z-10" : ""}
        md:flex-row md:gap-6 md:items-center
        lg:flex-col lg:gap-3 lg:items-start`}>
        {/* Name + Desc — mobile/desktop: row with button; tablet: col without button */}
        <div className="flex gap-2 items-center shrink-0 w-full
          md:flex-col md:items-start md:gap-0 md:flex-1 md:min-w-0 md:w-auto md:shrink-0
          lg:flex-row lg:gap-2 lg:items-center lg:w-full lg:shrink-0">
          <div className="flex flex-col flex-1 min-w-0 whitespace-nowrap">
            <p className="font-bold truncate" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{name}</p>
            <p className="truncate" style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>{desc}</p>
          </div>
          {/* Mobile + Desktop only button (hidden on tablet) */}
          <Button variant="outline" size="icon-xs" aria-label="ดูรายละเอียด" className="md:hidden lg:flex" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            <ArrowRightIcon size={16} />
          </Button>
        </div>
        {/* Stats — mobile/desktop: full-width below; tablet: flex-1 beside name */}
        <div className="flex gap-4 items-start justify-center shrink-0 w-full
          md:flex-1 md:w-auto md:shrink
          lg:shrink-0 lg:w-full"
          style={{ backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 8, padding: 8 }}
        >
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Coupon</p>
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{coupon}</p>
          </div>
          <div style={{ width: 1, alignSelf: "stretch", backgroundColor: "rgba(0,0,0,0.1)" }} />
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Tenor</p>
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{tenor}</p>
          </div>
        </div>
        {/* Tablet-only button (after stats) */}
        <Button variant="outline" size="icon-xs" aria-label="ดูรายละเอียด" className="hidden md:flex lg:hidden shrink-0" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
}

// ─── Investment Solution gradient backgrounds ────────────────────────────────
const GRAD_SECURE = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23f6f7fb'/><stop offset='1' stop-color='%23c5dbe8'/></radialGradient></defs></svg>\")";
const GRAD_BALANCED = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23ffedfc'/><stop offset='1' stop-color='%23f8d0d8'/></radialGradient></defs></svg>\")";
const GRAD_HIGH_CV = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23e5e3fe'/><stop offset='1' stop-color='%23d5beff'/></radialGradient></defs></svg>\")";

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

export function ProductCatalogTab() {
  const [activeProductTab, setActiveProductTab] = useState("structured");
  const [selectedFixedIncomeBond, setSelectedFixedIncomeBond] = useState<FixedIncomeBond | null>(null);
  const [selectedFixedIncomeCompany, setSelectedFixedIncomeCompany] = useState<string | null>(null);
  const [fixedIncomeView, setFixedIncomeView] = useState<"bond" | "company" | null>(null);
  const [selectedGlobalBondIssuer, setSelectedGlobalBondIssuer] = useState<GlobalBondIssuerId | null>(null);
  const [showAllGlobalBonds, setShowAllGlobalBonds] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StructuredProduct | null>(null);
  const [selectedTopIdea, setSelectedTopIdea] = useState<TopIdeaSector | null>(null);
  const [selectedInvestmentSolution, setSelectedInvestmentSolution] = useState<InvestmentSolutionId | null>(null);
  const [showAllTopIdeas, setShowAllTopIdeas] = useState(false);
  const [showAllStructuredProducts, setShowAllStructuredProducts] = useState(false);
  const [globalOrThai, setGlobalOrThai] = useState<"Global" | "Thai">("Global");
  const [showAlert, setShowAlert] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const topIdeaDrag = useDragScroll();

  const resetFixedIncomeNav = () => {
    setSelectedFixedIncomeBond(null);
    setSelectedFixedIncomeCompany(null);
    setFixedIncomeView(null);
  };

  if (showAllGlobalBonds) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <GlobalBondAllPage onBack={() => setShowAllGlobalBonds(false)} />
      </div>
    );
  }

  if (selectedGlobalBondIssuer) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <GlobalBondDetail
          issuerId={selectedGlobalBondIssuer}
          onBack={() => setSelectedGlobalBondIssuer(null)}
          onIssuerSelect={setSelectedGlobalBondIssuer}
        />
      </div>
    );
  }

  if (fixedIncomeView === "bond" && selectedFixedIncomeBond) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
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

  if (fixedIncomeView === "company" && selectedFixedIncomeCompany) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
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

  if (selectedProduct) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <StructuredProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      </div>
    );
  }

  if (selectedTopIdea) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <TopIdeaDetail
          sector={selectedTopIdea}
          onBack={() => setSelectedTopIdea(null)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  if (selectedInvestmentSolution) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <InvestmentSolutionDetail
          solution={getInvestmentSolution(selectedInvestmentSolution)}
          onBack={() => setSelectedInvestmentSolution(null)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  if (showAllTopIdeas) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <TopIdeaAllPage
          onBack={() => setShowAllTopIdeas(false)}
          onSelect={(sector) => setSelectedTopIdea(sector)}
        />
      </div>
    );
  }

  if (showAllStructuredProducts) {
    return (
      <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6">
        <StructuredProductAllPage
          onBack={() => setShowAllStructuredProducts(false)}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>
    );
  }

  return (
    // Root: full-bleed — negative margin + matching width expansion
    <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6" style={{ backgroundColor: "white" }}>

      {/* ── Mobile: gray rect + abs search + gray sticky tab bar (Figma pixel-perfect) ── */}
      <div className="lg:hidden">
        {/* Gray background rect h=127px — search is absolutely positioned inside */}
        <div className="relative shrink-0 w-full" style={{ backgroundColor: "#f3f4f6", height: 96 }}>
          <div className="absolute left-4 right-4" style={{ top: 24 }}>
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Discover your next investment"
              className="w-full"
            />
          </div>
        </div>
        {/* Tab bar — sticky top-0, text-only + scrollable
            --background overridden to transparent so Tab's bg-background shows gray parent */}
        <div
          className="sticky top-0 z-10 overflow-x-auto"
          style={{ backgroundColor: "#f3f4f6", scrollbarWidth: "none", ["--bg-default-primary" as string]: "transparent" }}
        >
          <TabGroup
            items={PRODUCT_TABS_MOBILE}
            activeId={activeProductTab}
            onChange={(id) => { setActiveProductTab(id); setSelectedProduct(null); setShowAllTopIdeas(false); setSelectedTopIdea(null); setSelectedInvestmentSolution(null); setShowAllStructuredProducts(false); resetFixedIncomeNav(); setSelectedGlobalBondIssuer(null); setShowAllGlobalBonds(false); }}
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
          placeholder="Discover your next investment"
          className="w-full max-w-[792px]"
        />
      </div>
      <div className="hidden lg:block px-4 lg:px-6">
        <TabGroup
          items={PRODUCT_TABS}
          activeId={activeProductTab}
          onChange={(id) => { setActiveProductTab(id); setSelectedProduct(null); setShowAllTopIdeas(false); setSelectedTopIdea(null); setSelectedInvestmentSolution(null); setShowAllStructuredProducts(false); resetFixedIncomeNav(); setSelectedGlobalBondIssuer(null); setShowAllGlobalBonds(false); }}
          size="md"
        />
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      {activeProductTab === "fixed-income" && (
        <FixedIncomeTab
          onBondSelect={(bond) => {
            setSelectedFixedIncomeBond(bond);
            setFixedIncomeView("bond");
          }}
        />
      )}

      {activeProductTab === "global-bond" && (
        <GlobalBondTab
          onIssuerSelect={setSelectedGlobalBondIssuer}
          onViewAll={() => setShowAllGlobalBonds(true)}
        />
      )}

      {activeProductTab === "structured" && (
      <div className="flex flex-col gap-6 items-center w-full" style={{ paddingTop: 24 }}>

        {/* Toast — bg-info-light, full-bleed mobile / max-w-[704px] desktop */}
        {showAlert && (
          <div className="px-4 lg:px-6 w-full flex justify-center">
            {/* Figma: flex items-center gap-2 — single flex row, text wraps naturally inside flex-1 */}
            <div
              className="flex gap-2 items-center overflow-hidden shrink-0 w-full"
              style={{
                backgroundColor: "#eff6ff", borderRadius: 8, padding: 12,
                boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.1),0px 1px 3px 1px rgba(0,0,0,0.05)",
                maxWidth: 704,
              }}
            >
              {/* Content (flex-1): icon + text forced to 2 lines with <br> — matches Figma exactly */}
              <div className="flex gap-2 items-center flex-1 min-w-0 opacity-80">
                <InfoIcon size={24} weight="fill" color="#2b7fff" className="shrink-0" />
                <p className="flex-1 min-w-0 max-w-40 md:max-w-none [word-break:break-word]" style={{ color: "#2b7fff", fontSize: 14, lineHeight: "20px" }}>
                  <span className="md:hidden">สำหรับนักลงทุนรายใหญ่/ รายใหญ่พิเศษ</span>
                  <span className="hidden md:inline">ผู้ลงทุนในสินทรัพย์นี้ต้องมีคุณสมบัติเป็นนักลงทุนรายใหญ่</span>
                </p>
              </div>
              {/* Content-R (shrink-0): action link + X */}
              <div className="flex gap-3 items-center shrink-0">
                <p
                  className="underline whitespace-nowrap cursor-pointer"
                  style={{ color: "#0a6ee7", fontSize: 14, lineHeight: "20px" }}
                  onClick={() => { }}
                >
                  อัปเดตสถานะ
                </p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="relative shrink-0 cursor-pointer"
                  style={{ width: 18, height: 18, background: "none", border: "none", padding: 0 }}
                  aria-label="ปิด"
                >
                  <XIcon size={18} color="#2b7fff" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Recommend 1 — bg-white (Switch + Waiting) ─────────────────────── */}
        <div className="flex flex-col gap-4 items-center shrink-0 w-full px-4 lg:px-6" style={{ backgroundColor: "white" }}>
          {/* Global/Thai + รายการคำสั่ง */}
          <div className="flex gap-4 items-center shrink-0 w-full">
            <div className="flex gap-1 items-center justify-center overflow-hidden flex-1"
              style={{ backgroundColor: "#f9fafb", borderRadius: 40, padding: 6 }}
            >
              {(["Global", "Thai"] as const).map((option) => {
                const sel = globalOrThai === option;
                return (
                  <button key={option} onClick={() => setGlobalOrThai(option)}
                    className="flex items-center justify-center overflow-hidden cursor-pointer transition-all flex-1"
                    style={{
                      borderRadius: 40, padding: 8,
                      backgroundColor: sel ? "white" : "transparent", border: "none",
                      boxShadow: sel ? "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    <p style={{ fontSize: 14, lineHeight: "20px", fontWeight: sel ? 700 : 400, color: sel ? "#101828" : "#6a7282", whiteSpace: "nowrap" }}>
                      {option}
                    </p>
                  </button>
                );
              })}
            </div>
            <Button variant="outline-black" size="icon-xl" aria-label="รายการคำสั่ง" className="rounded-full shrink-0 md:hidden">
              <ClockCounterClockwiseIcon size={20} />
            </Button>
            <Button variant="outline-black" size="xl" leftIcon={<ClockCounterClockwiseIcon size={20} className="-scale-x-100" />} className="rounded-full shrink-0 hidden md:flex">
              รายการคำสั่ง
            </Button>
          </div>
          {/* Waiting banner */}
          <div className="flex gap-2 items-center relative shrink-0 w-full"
            style={{ backgroundColor: "#fefce8", border: "1px solid #fff085", borderRadius: 8, padding: 12 }}
          >
            <div className="flex items-center p-1 shrink-0" style={{ backgroundColor: "#fef9c2", borderRadius: 4 }}>
              <HourglassHighIcon size={20} weight="fill" color="#ca8a04" />
            </div>
            <div className="flex flex-col gap-0.5 items-start justify-center flex-1 min-w-0">
              <p className="font-bold" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>รอดำเนินการ 2 รายการ</p>
              <p style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>จำนวนเงิน 300,000 USD</p>
            </div>
            <Button variant="outline-black" size="lg" className="shrink-0">ดูรายการ</Button>
          </div>
        </div>

        {/* ── Recommend 2 — bg-white (Top Idea) ────────────────────────────── */}
        <div className="flex flex-col gap-4 items-start shrink-0 w-full" style={{ backgroundColor: "white", paddingTop: 16, paddingBottom: 16 }}>
          {/* Header — with side padding */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Top idea
            </p>
            <Button variant="plain" size="sm" rightIcon={<ArrowRightIcon size={18} />} className="shrink-0" onClick={() => setShowAllTopIdeas(true)}>ทั้งหมด</Button>
          </div>
          {/* Scrollable cards — bleeds to screen edges, drag-to-scroll on desktop */}
          <div
            ref={topIdeaDrag.ref}
            className="overflow-x-auto w-full pb-3 hide-scrollbar"
            style={{ scrollbarWidth: "none", cursor: "grab" }}
            onMouseDown={topIdeaDrag.onMouseDown}
            onMouseMove={topIdeaDrag.onMouseMove}
            onMouseUp={topIdeaDrag.onMouseUp}
            onMouseLeave={topIdeaDrag.onMouseLeave}
          >
            <div className="flex gap-3.5 min-w-max px-4 lg:px-6">
              {TOP_IDEAS.map((idea, i) => (
                <TopIdeaCard key={i} sector={idea.sector} onClick={() => setSelectedTopIdea(idea.sector)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Investment Solution — no explicit bg + imgRecommend overlay ─────── */}
        <div className="flex flex-col gap-4 items-start relative shrink-0 w-full px-4 md:px-8 lg:px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={A.recommendBg} />
          <p className="font-bold relative shrink-0 overflow-hidden text-ellipsis w-full whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
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
                    imgSrc={isHighConviction ? A.imgHighConvBg : isBalanced ? A.imgBalancedGrowth : A.imgSecureIncome}
                    gradient={isHighConviction ? GRAD_HIGH_CV : isBalanced ? GRAD_BALANCED : GRAD_SECURE}
                    imgLeft={isHighConviction ? -67 : 12}
                    imgW={isHighConviction ? 198 : 72}
                    imgH={isHighConviction ? 132 : isBalanced ? 103 : 92}
                    imgRotation={isHighConviction ? 180 : undefined}
                    crop={!isHighConviction ? {
                      scaleX: isBalanced ? 0.7006 : 0.4390,
                      scaleY: 1.0,
                      tx: isBalanced ? 0.1464 : 0,
                      ty: 0,
                    } : undefined}
                    onClick={() => setSelectedInvestmentSolution(solution.id)}
                  />
                );
              })}
            </div>
            {/* Customize Underlying */}
            <div className="flex gap-2 items-center relative shrink-0 w-full"
              style={{ backgroundColor: "white", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 12, paddingLeft: 32, paddingRight: 32, paddingTop: 16, paddingBottom: 16 }}
            >
              <SparkleIcon size={24} weight="fill" className="shrink-0 text-primary-action" />
              <div className="flex flex-col gap-0.5 items-start flex-1 min-w-0 whitespace-nowrap">
                <p className="font-bold overflow-hidden text-ellipsis w-full" style={{ color: "#4a5565", fontSize: 16, lineHeight: "24px" }}>Customize Underlying</p>
                <p className="overflow-hidden text-ellipsis w-full" style={{ color: "#6a7282", fontSize: 14, lineHeight: "20px" }}>ออกแบบสินทรัพย์ด้วยตนเอง</p>
              </div>
              <Button variant="outline-black" size="lg" leftIcon={<PhoneIcon size={20} />} className="shrink-0">ติดต่อ</Button>
            </div>
          </div>
        </div>

        {/* ── Main Container — bg-white (Top Pick) ─────────────────────────── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full px-4 md:px-8 lg:px-6" style={{ backgroundColor: "white", paddingTop: 24, paddingBottom: 24 }}>
          <div className="flex gap-1 items-center shrink-0 w-full">
            <FireIcon size={24} weight="fill" color="#f97316" className="shrink-0 md:hidden lg:block" />
            <FireIcon size={20} weight="fill" color="#f97316" className="shrink-0 hidden md:block lg:hidden" />
            <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap text-xl leading-[30px] md:text-lg md:leading-6 lg:text-xl lg:leading-[30px]" style={{ color: "#101828" }}>
              Top pick
            </p>
          </div>
          <div className="grid grid-cols-1 md:flex md:flex-col lg:grid lg:grid-cols-3 gap-4 shrink-0 w-full">
            {TOP_PICKS.map((p) => (
              <StructuredProductCard key={p.id} {...p} onClick={() => setSelectedProduct(p)} />
            ))}
          </div>
        </div>

        {/* ── Main Container — bg-[#f9fafb] (Structured Product) full-bleed ─── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full" style={{ backgroundColor: "#f9fafb", paddingTop: 24, paddingBottom: 24 }}>
          {/* Header */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Structured Product
            </p>
            <Button variant="outline-black" size="icon-lg" aria-label="ตัวกรอง" className="shrink-0 md:hidden">
              <FunnelSimpleIcon size={18} />
            </Button>
            <Button variant="outline-black" size="md" leftIcon={<FunnelSimpleIcon size={18} />} className="shrink-0 hidden md:flex">ตัวกรอง</Button>
          </div>
          {/* 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 w-full px-4 lg:px-6">
            {STRUCTURED_PRODUCTS.map((p) => (
              <StructuredProductCard key={p.id} {...p} onClick={() => setSelectedProduct(p)} />
            ))}
          </div>
          {/* ดูทั้งหมด */}
          <Button variant="plain" size="sm" className="shrink-0" onClick={() => setShowAllStructuredProducts(true)}>ดูทั้งหมด</Button>
        </div>

      </div>
      )}
    </div>
  );
}
