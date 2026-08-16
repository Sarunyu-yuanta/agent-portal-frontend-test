"use client";

import { useEffect, useState } from "react";
import { SearchInput, TabGroup } from "@sarunyu/system-one";
import {
  ChartPieSliceIcon,
  FlagIcon,
  GlobeHemisphereWestIcon,
  HandCoinsIcon,
  HandshakeIcon,
} from "@phosphor-icons/react";
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
import { ThaiStructuredProductTable } from "./ThaiStructuredProductTable";
import { TopIdeaAllPage } from "./TopIdeaAllPage";
import { TopIdeaDetail } from "./TopIdeaDetail";
import { InvestmentSolutionDetail } from "./InvestmentSolutionDetail";
import type { TopIdeaSector } from "./top-idea-data";
import { useScrollThreshold } from "./use-scroll-threshold";
import { useDragScroll } from "./use-drag-scroll";
import type { StructuredProduct } from "./structured-product-data";
import {
  getInvestmentSolution,
  type InvestmentSolutionId,
} from "./investment-solution-data";
import {
  InvestmentSolutionSection,
  StructuredProductGridSection,
  TopIdeaStrip,
  TopPickSection,
} from "./ProductCatalogSections";

const PRODUCT_TABS = [
  { id: "structured",      title: "Global Structured Product", icon: <GlobeHemisphereWestIcon size={18} /> },
  { id: "thai-structured", title: "Thai Structured Product",   icon: <FlagIcon size={18} /> },
  { id: "fixed-income",    title: "Fixed Income",              icon: <HandCoinsIcon size={18} /> },
  { id: "global-bond",     title: "Global Bond",               icon: <HandshakeIcon size={18} /> },
  { id: "mutual-fund",     title: "Mutual Fund",               icon: <ChartPieSliceIcon size={18} /> },
];

const PRODUCT_TABS_MOBILE = PRODUCT_TABS.map(({ id, title }) => ({ id, title }));

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

  const [searchValueInternal, setSearchValueInternal] = useState("");
  const searchValue = searchValueProp ?? searchValueInternal;
  const setSearchValue = onSearchChange ?? setSearchValueInternal;

  const mobileScrolled = useScrollThreshold();
  const drag = useDragScroll();

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

  // ── State-based detail views ────────────────────────────────────────────────
  // Only used when URL navigation is not provided (e.g. client pages).

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
      {/* ── Mobile/Tablet: sticky search + tab bar — always expanded, never collapses ── */}
      <div
        className="sticky top-0 z-30 flex flex-col lg:hidden"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="px-4 pt-6 pb-4">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="ค้นหาสินทรัพย์"
            className="w-full"
          />
        </div>
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
            className="w-max"
          />
        </div>
      </div>

      {/* ── Desktop: search + tab bar, one shared section ────────────── */}
      <div className={`hidden lg:flex flex-col shrink-0 w-full bg-gradient-to-t from-[#f7f7f7] to-white sticky top-0 z-30 transition-shadow duration-300 ease-out ${mobileScrolled ? "shadow-sm" : ""}`}>
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${mobileScrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        >
          <div className="overflow-hidden min-h-0">
            <div
              className="flex flex-col items-center justify-center px-6"
              style={{ height: 120, paddingTop: 32, paddingBottom: 24 }}
            >
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="ค้นหาสินทรัพย์"
                className="w-full max-w-[792px]"
              />
            </div>
          </div>
        </div>
        <div
          className={`max-w-[1280px] mx-auto w-full px-4 lg:px-6 overflow-x-auto [--bg-default-primary:transparent] transition-[padding] duration-300 ease-out ${mobileScrolled ? "pt-6" : ""}`}
          style={{ scrollbarWidth: "none" }}
        >
          <TabGroup
            items={PRODUCT_TABS}
            activeId={activeProductTab}
            onChange={handleProductTabChange}
            size="md"
            className="w-max"
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
        <div className="flex flex-col gap-6 items-center w-full" style={{ paddingTop: 24 }}>
          <TopIdeaStrip
            drag={drag}
            onTopIdeaSelect={nav.onTopIdeaSelect}
            onAllTopIdeasView={nav.onAllTopIdeasView}
          />
          <InvestmentSolutionSection onInvestmentSolutionSelect={nav.onInvestmentSolutionSelect} />
          <TopPickSection onProductSelect={nav.onProductSelect} />
          <StructuredProductGridSection
            title="All Global Structured Product"
            onProductSelect={nav.onProductSelect}
            onAllProductsView={nav.onAllProductsView}
          />
        </div>
      )}

      {activeProductTab === "thai-structured" && (
        <div className="flex flex-col gap-6 items-center w-full" style={{ paddingTop: 24 }}>
          <TopIdeaStrip
            drag={drag}
            onTopIdeaSelect={nav.onTopIdeaSelect}
            onAllTopIdeasView={nav.onAllTopIdeasView}
          />
          <InvestmentSolutionSection onInvestmentSolutionSelect={nav.onInvestmentSolutionSelect} />
          <TopPickSection onProductSelect={nav.onProductSelect} />
          <StructuredProductGridSection
            title="Structured Product"
            onProductSelect={nav.onProductSelect}
            onAllProductsView={nav.onAllProductsView}
          />

          {/* ── Thai FCN Table ─────────────────────────────────────────────────── */}
          <div className="w-full" style={{ backgroundColor: "white", paddingTop: 24, paddingBottom: 24 }}>
            <div className="flex flex-col gap-4 w-full max-w-[1280px] mx-auto px-4 lg:px-6">
              <p
                className="font-bold"
                style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}
              >
                All Thai FCN
              </p>
              <ThaiStructuredProductTable />
            </div>
          </div>
        </div>
      )}

      {activeProductTab === "mutual-fund" && (
        <div
          className="flex flex-col items-center justify-center gap-3 w-full text-center px-4"
          style={{ backgroundColor: "#f9fafb", paddingTop: 96, paddingBottom: 96 }}
        >
          <ChartPieSliceIcon size={40} className="text-muted-foreground/40" weight="duotone" />
          <p className="type-subtitle-1 font-semibold text-[var(--text-default-secondary)]">Mutual Fund</p>
          <p className="type-body-2 text-[var(--text-default-tertiary)] max-w-xs">กองทุนรวมจะแสดงที่นี่เร็วๆ นี้</p>
        </div>
      )}
    </div>
  );
}
