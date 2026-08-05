"use client";

import { useState, useEffect, type ComponentProps } from "react";
import { Tag, Button, Chip, TabGroup, Modal, BottomSheet, Dropdown, DateInput, SearchInput } from "@sarunyu/system-one";
import {
  SparkleIcon,
  TrendUpIcon,
  TrendDownIcon,
  MinusIcon,
  ArrowRightIcon,
  SunIcon,
  BroadcastIcon,
  BriefcaseIcon,
  BuildingsIcon,
  NotePencilIcon,
  FileTextIcon,
  LightningIcon,
  ChartLineUpIcon,
  FactoryIcon,
  GlobeIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { mockHouseViewStrategies, mockAnalysts, type AnalystItem } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { CATEGORY_TAG_VARIANT, CATEGORY_ACCENT_COLOR, STRATEGY_DETAIL, getCategory } from "./house-view-data";
import { AIRecommendCard } from "./AIRecommendCard";
import { PlaybookCardCompact } from "./PlaybookCardCompact";

// ─── Category styling ─────────────────────────────────────────────────────────

type AssetClassFilter = "All" | "Hot issue" | "Buy list" | "Asset performance" | "Market calendar" | "Asset class outlook" | "Market outlook";

const ASSET_FILTERS: AssetClassFilter[] = [
  "All", "Hot issue", "Buy list", "Asset performance",
  "Market calendar", "Asset class outlook", "Market outlook",
];

// ─── Types & helpers ──────────────────────────────────────────────────────────

type StrategyItem = (typeof mockHouseViewStrategies)[number] & {
  period: string;
  periodLabel: string;
  category: string;
};

function groupByPeriodLabel(strategies: StrategyItem[]) {
  const seen = new Set<string>();
  const order: { period: string; periodLabel: string }[] = [];
  for (const s of strategies) {
    const key = `${s.period}__${s.periodLabel}`;
    if (!seen.has(key)) {
      seen.add(key);
      order.push({ period: s.period, periodLabel: s.periodLabel });
    }
  }
  return order.map(({ period, periodLabel }) => ({
    period,
    periodLabel,
    items: strategies.filter((s) => s.period === period && s.periodLabel === periodLabel),
  }));
}

const GRID_LIMIT = 4;

type ModalGroup = { period: string; periodLabel: string; items: StrategyItem[] } | null;

// ─── Strategy Playbook Card ───────────────────────────────────────────────────

function PlaybookCard({ strategy, noBorder }: { strategy: (typeof mockHouseViewStrategies)[number]; noBorder?: boolean }) {
  const cat = getCategory(strategy);
  const router = useRouter();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/house-view-mvp/${strategy.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/house-view-mvp/${strategy.id}`); }}
      className={`overflow-hidden flex h-full cursor-pointer hover:bg-muted/30 transition-colors ${noBorder ? "" : "rounded-2xl border border-border bg-card"}`}
    >
      <div className="w-1 shrink-0" style={{ background: CATEGORY_ACCENT_COLOR[cat] ?? "#6b7280" }} />
      <div className="flex-1 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Tag text={cat} variant={CATEGORY_TAG_VARIANT[cat] ?? "gray"} size="small" />
          <p className="text-[20px] font-bold text-foreground leading-tight">{strategy.name}</p>
        </div>
        <p className="text-[12px] text-foreground leading-relaxed">{STRATEGY_DETAIL[strategy.id]?.rationale}</p>
      </div>
    </div>
  );
}


// ─── Strategy Playbooks Section ───────────────────────────────────────────────

function StrategyPlaybooks() {
  const [filter, setFilter] = useState<AssetClassFilter>("All");
  const [modalGroup, setModalGroup] = useState<ModalGroup>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const all = mockHouseViewStrategies as unknown as StrategyItem[];
  const filtered = filter === "All" ? all : all.filter((s) => s.category === filter);
  const isFiltered = filter !== "All";
  const groups = groupByPeriodLabel(filtered);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="-mx-4 xl:-mx-6 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap md:flex-wrap px-4 xl:px-6">
          {ASSET_FILTERS.map((f) => (
            <span key={f} className="shrink-0">
              <Chip label={f} type="single" size="small" selected={filter === f} onClick={() => setFilter(f)} />
            </span>
          ))}
        </div>
      </div>

      {groups.map((group, idx) => {
        const isFirstMonthly = !isFiltered && idx === 0 && group.period === "monthly";
        const [featured, ...rest] = group.items;
        const periodBadge = group.period === "monthly" ? "Monthly" : "Weekly";
        const gridItems = isFirstMonthly ? rest : group.items;
        const hasMore = gridItems.length > GRID_LIMIT;

        return (
          <div key={`${group.period}-${group.periodLabel}`} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-primary-action-light text-primary-action text-[11px] font-bold">{periodBadge}</span>
                <p className="type-subtitle-1 font-bold text-foreground">{group.periodLabel}</p>
              </div>
              {(hasMore && !isFirstMonthly) || isFirstMonthly ? (
                <Button size="sm" variant="plain" rightIcon={<ArrowRightIcon size={12} />} onClick={() => setModalGroup(group)} className={isFirstMonthly ? "lg:hidden" : ""}>
                  ดูทั้งหมด
                </Button>
              ) : null}
            </div>

            {isFirstMonthly ? (
              <>
                {/* Desktop: combined card */}
                <div className="hidden lg:flex rounded-2xl border border-border bg-card overflow-hidden flex-col lg:flex-row">
                  <div className="flex-1 min-w-0">
                    <PlaybookCard strategy={featured as (typeof mockHouseViewStrategies)[number]} noBorder />
                  </div>
                  {rest.length > 0 && (
                    <div className="hide-scrollbar flex flex-col border-t lg:border-t-0 lg:border-l border-border lg:w-[45%] shrink-0 overflow-y-auto max-h-[306px]">
                      <div className="flex flex-col divide-y divide-border">
                        {rest.map((s) => (
                          <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} noBorder />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile: separate cards + view all */}
                <div className="flex flex-col gap-3 lg:hidden">
                  <PlaybookCard strategy={featured as (typeof mockHouseViewStrategies)[number]} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rest.slice(0, 3).map((s) => (
                      <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gridItems.slice(0, GRID_LIMIT).map((s) => (
                  <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Mobile: library BottomSheet */}
      <BottomSheet
        open={!!modalGroup && isMobile}
        onOpenChange={(o) => { if (!o) setModalGroup(null); }}
        title={modalGroup ? `${modalGroup.period === "monthly" ? "Monthly" : "Weekly"} — ${modalGroup.periodLabel}` : ""}
        showHandle
        showHeader
        rightSide="none"
        contentClassName="overflow-y-auto"
      >
        <div className="flex flex-col gap-3 pb-8">
          {modalGroup?.items.map((s) => (
            <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} />
          ))}
        </div>
      </BottomSheet>

      {/* Desktop: centered modal */}
      {modalGroup && !isMobile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={() => setModalGroup(null)}
          role="presentation"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Modal
              variant="content"
              title={`${modalGroup.period === "monthly" ? "Monthly" : "Weekly"} — ${modalGroup.periodLabel}`}
              showClose
              onClose={() => setModalGroup(null)}
              className="w-[calc(100vw-2rem)] max-w-[720px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar py-1">
                {modalGroup.items.map((s) => (
                  <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} />
                ))}
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────

function RightSidebar() {
  return (
    <div className="flex flex-col gap-5 sticky top-6 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
      <AIRecommendCard />
    </div>
  );
}

// ─── Research 4U ─────────────────────────────────────────────────────────────

const R4U_CATS = [
  "บทวิเคราะห์ทั้งหมด",
  "Wealth Designs Daily",
  "Chart Perspective Morning",
  "Chart Perspective Afternoon",
  "Derivative",
  "บทวิเคราะห์หุ้นรายตัว",
  "บทวิเคราะห์อุตสาหกรรม",
  "ความเห็นนักวิเคราะห์",
  "Theme Strategy",
  "Trading Portfolio",
  "Wealth Compass",
  "ELN Pick",
  "Technical Trading Portfolio",
  "SBL IDEA",
  "Top 5 DCA",
  "Yuanta Universe",
  "เอกสารการสัมมนา",
  "จับข่าวมาเล่าหุ้น",
  "Yuanta Global Wealth",
  "Commodities Highlight",
  "Power Investing",
] as const;

const MOCK_PDF_URL = "/mock-reports/sample-report.pdf";

type R4UItem = { id: string; date: string; category: string; title: string };

const MOCK_R4U: R4UItem[] = [
  { id: "r01", date: "03/08/2569", category: "Derivative",                  title: "DERIVATIVES - AFTERNOON" },
  { id: "r02", date: "03/08/2569", category: "Yuanta Global Wealth",        title: "Global Insights - Cancelled Attacks on Iran: Unlocking Energy Market Overhang" },
  { id: "r03", date: "03/08/2569", category: "Chart Perspective Afternoon", title: "TECHNICAL - BDMS, LH, M" },
  { id: "r04", date: "03/08/2569", category: "จับข่าวมาเล่าหุ้น",           title: "จับข่าวมาเล่าหุ้น - ENERGY, BANPU, TLI, TASCO" },
  { id: "r05", date: "03/08/2569", category: "Wealth Designs Daily",        title: "Sentiment การลงทุนยังดีในช่วงสั้น แนะนำสะสม CBG, SJWD, TASCO, JMART" },
  { id: "r06", date: "03/08/2569", category: "Wealth Signal",               title: "WEALTH SIGNAL - The Pullback Has a Purpose: Repricing Risk, Revealing the Winners - Part 2" },
  { id: "r07", date: "03/08/2569", category: "Wealth Signal",               title: "WEALTH SIGNAL - The Pullback Has a Purpose: Repricing Risk, Revealing the Winners - Part 1" },
  { id: "r08", date: "03/08/2569", category: "Chart Perspective Morning",   title: "TECHNICAL - STA, HMPRO, JMART, SISB, SAMART, CKP" },
  { id: "r09", date: "03/08/2569", category: "Power Investing",             title: "POWER INVESTING - CBG, SJWD, TASCO" },
  { id: "r10", date: "03/08/2569", category: "Top 5 DCA",                   title: "TOP 5 DCA - GULF, SJWD, TASCO, ITC, MTC" },
  { id: "r11", date: "02/08/2569", category: "Wealth Designs Daily",        title: "Market Wrap - SET ปรับตัวขึ้น นำโดยกลุ่มพลังงานและธนาคาร" },
  { id: "r12", date: "02/08/2569", category: "Theme Strategy",              title: "THEME STRATEGY - AI Infrastructure Play: Data Center & Power" },
  { id: "r13", date: "02/08/2569", category: "Trading Portfolio",           title: "TRADING PORTFOLIO UPDATE - สัปดาห์ที่ 31/2569" },
  { id: "r14", date: "02/08/2569", category: "Commodities Highlight",       title: "COMMODITIES HIGHLIGHT - Gold & Oil Outlook Q3/2026" },
  { id: "r15", date: "01/08/2569", category: "Wealth Compass",              title: "WEALTH COMPASS - Asset Allocation Monthly: สิงหาคม 2569" },
  { id: "r16", date: "01/08/2569", category: "ELN Pick",                    title: "ELN PICK - DELTA, AOT, PTT: Attractive Entry for Structured Products" },
  { id: "r17", date: "01/08/2569", category: "SBL IDEA",                    title: "SBL IDEA - Short Selling Opportunity: GULF, INTUCH" },
  { id: "r18", date: "01/08/2569", category: "Yuanta Universe",             title: "YUANTA UNIVERSE - Monthly Model Portfolio Rebalancing" },
  { id: "r19", date: "01/08/2569", category: "ความเห็นนักวิเคราะห์",         title: "Daily Morning Note - Macro Outlook & Stock Picks" },
  { id: "r20", date: "31/07/2569", category: "บทวิเคราะห์หุ้นรายตัว",        title: "PTTEP - Maintain BUY, TP 155 บาท: Strong Cash Flow Despite Oil Weakness" },
  { id: "r21", date: "31/07/2569", category: "บทวิเคราะห์อุตสาหกรรม",        title: "Sector Report: Thai Banking Sector - Asset Quality Improvement Ahead" },
  { id: "r22", date: "31/07/2569", category: "Technical Trading Portfolio", title: "TECHNICAL TRADING - Buy Signals: ADVANC, CPALL, GULF" },
  { id: "r23", date: "30/07/2569", category: "เอกสารการสัมมนา",             title: "Wealth Seminar: Navigating Volatility in Global Markets - สไลด์ประกอบการสัมมนา" },
];


function AnalystCard({ analyst }: { analyst: AnalystItem }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 hover:bg-muted/30 transition-colors">
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size headshot, no responsive sizes needed */}
      <img src={analyst.photo} alt={analyst.name} className="w-14 h-14 sm:w-24 sm:h-24 rounded-lg object-cover shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-[13px] font-bold text-foreground">{analyst.name}</p>
        <p className="text-[12px] text-muted-foreground leading-snug">{analyst.title}</p>
      </div>
    </div>
  );
}

type LandingTile = { id: string; title: string; subtitle: string; icon: PhosphorIcon; color: string; span?: string };

const R4U_LANDING_TILES: LandingTile[] = [
  { id: "t01", title: "Smart Pick",          subtitle: "แนะนำหุ้นเด่นประจำวัน",  icon: SparkleIcon,      color: "#f59e0b", span: "lg:col-start-1 lg:row-start-1 lg:row-span-2" },
  { id: "t02", title: "Afternoon Tactic",    subtitle: "แนวโน้มตลาดบ่าย",        icon: SunIcon,          color: "#f97316" },
  { id: "t03", title: "Yuanta Channel",      subtitle: "ช่องทางอัปเดตข่าวสาร",  icon: BroadcastIcon,    color: "#06b6d4" },
  { id: "t04", title: "เปิดพอร์ตโชว์หุ้น",   subtitle: "พอร์ตจำลองแนะนำ",       icon: BriefcaseIcon,    color: "#64748b" },
  { id: "t13", title: "Theme Strategy",      subtitle: "ธีมการลงทุนเด่น",        icon: PuzzlePieceIcon,  color: "#6366f1" },
  { id: "t10", title: "Sector Update",       subtitle: "วิเคราะห์อุตสาหกรรม",    icon: FactoryIcon,      color: "#3f3f46" },
  { id: "t05", title: "Company Focus",       subtitle: "วิเคราะห์หุ้นรายตัว",    icon: BuildingsIcon,    color: "#0ea5e9" },
  { id: "t07", title: "Warrant UPDATE",      subtitle: "อัปเดตวอร์แรนต์",       icon: FileTextIcon,     color: "#71717a", span: "lg:col-start-3 lg:row-start-3 lg:row-span-2" },
  { id: "t08", title: "Derivative Warrant",  subtitle: "อนุพันธ์และวอร์แรนต์",  icon: LightningIcon,    color: "#ef4444", span: "lg:col-start-1 lg:row-start-4 lg:col-span-2" },
  { id: "t09", title: "เทคนิคและอนุพันธ์",   subtitle: "Technical & Future",     icon: ChartLineUpIcon,  color: "#8b5cf6", span: "lg:col-start-1 lg:row-start-5 lg:row-span-2" },
  { id: "t06", title: "Analyst Note",        subtitle: "ความเห็นนักวิเคราะห์",   icon: NotePencilIcon,   color: "#10b981" },
  { id: "t11", title: "Yuanta Universe",     subtitle: "โมเดลพอร์ตการลงทุน",     icon: GlobeIcon,        color: "#0891b2" },
  { id: "t12", title: "Top 5 DCA",           subtitle: "หุ้นเด่นสะสมประจำสัปดาห์", icon: TrophyIcon,      color: "#52525b", span: "lg:col-start-2 lg:row-start-6 lg:col-span-2" },
];

function tintIcon(IconComp: PhosphorIcon, color: string) {
  function TintedIcon({ className, style, ...props }: ComponentProps<PhosphorIcon>) {
    return <IconComp className={className} style={{ ...style, color }} {...props} />;
  }
  return TintedIcon;
}

function R4ULandingGrid() {
  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
      <BentoGrid className="grid-cols-2 lg:grid-cols-3 auto-rows-[130px] lg:auto-rows-[150px] gap-2 lg:gap-3 grid-flow-dense">
        {R4U_LANDING_TILES.map((tile) => (
          <BentoCard
            key={tile.id}
            name={tile.title}
            description={tile.subtitle}
            href={MOCK_PDF_URL}
            cta="เปิดเอกสาร"
            Icon={tintIcon(tile.icon, tile.color)}
            className={tile.span ?? "col-span-1 row-span-1"}
            background={
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{ background: `radial-gradient(140% 140% at 100% 0%, ${tile.color}, transparent 60%)` }}
              />
            }
          />
        ))}
      </BentoGrid>
    </div>
  );
}

const R4U_HOME_OPTION = "__home__";

function Research4U() {
  const [subTab, setSubTab] = useState<"research" | "analyst">("research");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateInputResetKey, setDateInputResetKey] = useState(0);

  const goHome = () => {
    setActiveCategory(null);
    setSearchQuery("");
    setSearchDate(undefined);
    setDateInputResetKey((k) => k + 1);
  };

  const isSearching = searchQuery.trim().length > 0;
  const showList = activeCategory !== null || isSearching || searchDate !== undefined;

  const filtered = MOCK_R4U.filter((item) => {
    const catOk = activeCategory === null || activeCategory === "บทวิเคราะห์ทั้งหมด" || item.category === activeCategory;
    const dateOk = !searchDate || (() => {
      const d = searchDate.getDate().toString().padStart(2, "0");
      const m = (searchDate.getMonth() + 1).toString().padStart(2, "0");
      const y = (searchDate.getFullYear() + 543).toString();
      return item.date === `${d}/${m}/${y}`;
    })();
    const searchOk = !isSearching || item.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return catOk && dateOk && searchOk;
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col md:max-h-[72vh]">

      {/* Research / Analyst Contact sub-tabs — full width, above sidebar + content */}
      <div className="flex items-center justify-between gap-4 px-3 pt-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2 pb-2">
          <Chip label="Research" type="single" selected={subTab === "research"} onClick={() => setSubTab("research")} />
          <Chip label="Analyst Contact" type="single" selected={subTab === "analyst"} onClick={() => setSubTab("analyst")} />
        </div>
        <div className={`hidden md:flex items-center gap-2 pb-2 ${subTab === "research" ? "" : "invisible"}`}>
          <SearchInput
            placeholder="ค้นหาชื่อหุ้น"
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            size="lg"
            className="w-80"
          />
          <DateInput
            key={dateInputResetKey}
            mode="single"
            placeholder="เลือกวันที่"
            value={searchDate}
            onChange={setSearchDate}
            className="w-56"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">

        {/* Left sidebar — desktop, Research tab only */}
        {subTab === "research" && (
          <div className="hidden md:flex flex-col w-52 shrink-0 border-r border-border overflow-y-auto hide-scrollbar">
            <button
              type="button"
              onClick={goHome}
              className={`text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer border-b border-border/40 ${
                !showList
                  ? "bg-primary-action-light text-primary-action font-semibold"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              หน้าแรก
            </button>
            {R4U_CATS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer border-b border-border/40 last:border-0 ${
                  activeCategory === cat
                    ? "bg-primary-action-light text-primary-action font-semibold"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Right content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {subTab === "analyst" ? (
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockAnalysts.map((analyst) => (
                  <AnalystCard key={analyst.id} analyst={analyst} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile category picker — always visible so mobile users have a way to browse
                  categories without the desktop-only sidebar */}
              <div className="md:hidden flex flex-col gap-2 p-3 border-b border-border shrink-0">
                <SearchInput
                  placeholder="ค้นหาชื่อหุ้น"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  className="w-full"
                />
                <DateInput
                  key={dateInputResetKey}
                  mode="single"
                  placeholder="เลือกวันที่"
                  value={searchDate}
                  onChange={setSearchDate}
                  className="w-full"
                />
                <Dropdown
                  value={activeCategory ?? R4U_HOME_OPTION}
                  onChange={(v) => {
                    if (v === R4U_HOME_OPTION) {
                      goHome();
                    } else {
                      setActiveCategory(v);
                    }
                  }}
                  options={[
                    { label: "‹ หน้าแรก", value: R4U_HOME_OPTION },
                    ...R4U_CATS.map((c) => ({ label: c, value: c })),
                  ]}
                  placeholder="เลือกหมวดบทวิเคราะห์"
                />
              </div>

              {!showList ? (
                <R4ULandingGrid />
              ) : (
                <>
                  {/* Column headers — desktop */}
                  <div
                    className="hidden md:grid px-5 py-2.5 bg-muted/40 border-b border-border shrink-0"
                    style={{ gridTemplateColumns: "110px 180px 1fr" }}
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">วันที่</span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">บทวิเคราะห์</span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">รายละเอียด</span>
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto hide-scrollbar divide-y divide-border">
                    {filtered.length === 0 ? (
                      <div className="flex items-center justify-center py-16 text-[13px] text-muted-foreground">
                        ไม่พบข้อมูลที่ค้นหา
                      </div>
                    ) : (
                      filtered.map((item) => (
                        <a
                          key={item.id}
                          href={MOCK_PDF_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col gap-0.5 md:grid md:gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                          style={{ gridTemplateColumns: "110px 180px 1fr" }}
                        >
                          <span className="text-[12px] text-muted-foreground">{item.date}</span>
                          <span className="text-[13px] text-foreground">{item.category}</span>
                          <span className="text-[13px] text-primary-action group-hover:underline leading-snug">{item.title}</span>
                        </a>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HouseViewPage() {
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="flex flex-col gap-6">
      <div className="transparent-tabs scrollable-tabs -mx-4 xl:-mx-6 pl-4 xl:pl-6">
        <TabGroup
          items={[
            { id: "insights",   title: "Insights" },
            { id: "research4u", title: "Research 4U" },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          size="md"
        />
      </div>

      {activeTab === "insights" ? (
        <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
          <StrategyPlaybooks />
          <RightSidebar />
        </div>
      ) : (
        <Research4U />
      )}
    </div>
  );
}
