"use client";

import { useState, useEffect } from "react";
import { Tag, Button, Chip, TabGroup, Modal, BottomSheet, Dropdown, DateInput } from "@sarunyu/system-one";
import {
  SparkleIcon,
  TrendUpIcon,
  TrendDownIcon,
  MinusIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { mockHouseViewStrategies } from "@/lib/mock-data";

// ─── Category styling ─────────────────────────────────────────────────────────

type AssetClassFilter = "All" | "Hot issue" | "Buy list" | "Asset performance" | "Market calendar" | "Asset class outlook" | "Market outlook";

const ASSET_FILTERS: AssetClassFilter[] = [
  "All", "Hot issue", "Buy list", "Asset performance",
  "Market calendar", "Asset class outlook", "Market outlook",
];

const CATEGORY_TAG_VARIANT: Record<string, "red" | "green" | "blue" | "lime" | "yellow" | "gray"> = {
  "Hot issue":           "red",
  "Buy list":            "green",
  "Asset performance":   "blue",
  "Market calendar":     "lime",
  "Asset class outlook": "yellow",
  "Market outlook":      "gray",
};

const CATEGORY_ACCENT_COLOR: Record<string, string> = {
  "Hot issue":           "#ef4444",
  "Buy list":            "#22c55e",
  "Asset performance":   "#3b82f6",
  "Market calendar":     "#a855f7",
  "Asset class outlook": "#eab308",
  "Market outlook":      "#6b7280",
};

// ─── Strategy detail (rationale only) ────────────────────────────────────────

const STRATEGY_DETAIL: Record<string, { rationale: string }> = {
  s1:  { rationale: "Micron เซ็น SCA ครบ 16 ฉบับ ขณะที่ supply ยังตึงถึงปี 2028 — จังหวะนี้คือ valuation reset ไม่ใช่จุดจบ cycle นักลงทุนที่ออกไปรอ correction อาจพลาด re-rating ที่เกิดขึ้นแล้ว" },
  s2:  { rationale: "Core CPI ต่ำกว่าคาด 3 เดือนติด ตลาดยังไม่ price in โอกาสที่ Fed หยุดรอแทนที่จะขึ้น — กำไรบริษัทเป็นตัวชี้วัดที่สำคัญกว่า yield level" },
  s3:  { rationale: "Hyperscaler capex ขยายสู่ Sovereign AI และ Enterprise — addressable market ใหญ่กว่าที่นักวิเคราะห์คาด 3 เท่า ขณะที่ราคาหุ้นยังสะท้อนเฉพาะ Hyperscaler demand" },
  s4:  { rationale: "Geopolitical risk premium ลดลงหลังการเจรจา ขณะที่ Rotation จาก Growth สู่ Value เริ่มชัดเจน — สินทรัพย์ที่ได้รับ premium จาก geopolitical fear จะถูก re-price" },
  s5:  { rationale: "เมื่อเฟดส่งสัญญาณขึ้นดอกเบี้ยลายปี Bear Flattening ยิ่งชัด — Playbook ของพอร์ตต้องเปลี่ยนตาม ลด duration ยาว เพิ่ม floating rate และ short-end exposure" },
  s6:  { rationale: "HBM4E เข้าสู่รอบ qualification เร็วกว่าคาด ขณะที่ Intel Foundry turnaround และ BESI ยกเป้าปี 2030 ยืนยัน AI semiconductor supercycle ยังไม่จบ" },
  s7:  { rationale: "FERC และ ERCOT ออกกฎใหม่ Time to Power สำหรับ AI data center ขนาดใหญ่ เพิ่ม visibility ต่อ capex ด้านพลังงาน — utilities และ power infrastructure เป็น beneficiary โดยตรง" },
  s8:  { rationale: "หุ้นเกาหลีพุ่งนำโลกสัปดาห์นี้ ขณะพลังงานและทองคำโดนแรงขาย — Selective plays ในกลุ่ม Value ที่ยังมี dividend yield น่าสนใจในสภาวะ rotation" },
  s9:  { rationale: "Bank lending pullback creates a supply gap in senior secured private credit. Direct lending at 9–11% yield with first-lien security — asymmetric risk/reward." },
  s10: { rationale: "Strongest GDP trajectory in G20 at 6.5–7%. Demographic dividend, manufacturing FDI inflows, and middle-class consumption boom create a multi-decade compounding story." },
  s11: { rationale: "เมื่อ AI ก้าวสู่ Agentic AI กำไรบริษัทจดทะเบียนแรงสุดในรอบ 5 ปี ขณะที่ตลาด Memory โลกถูกปรับประมาณการขึ้น" },
  s12: { rationale: "เมื่อ rack ของ NVIDIA ในปี 2028 ใช้ไฟมากกว่า 1 เมกะวัตต์ สถาปัตยกรรม 800VDC ไม่ใช่แค่เรื่องวิศวกรรม — แต่คือธีมการลงทุนใหม่" },
  s13: { rationale: "เมื่อน้ำมันดิ้งและชิปพุ่ง ตลาดโลกเดือนมิถุนายนบอกอะไรเราเกี่ยวกับโอกาสและความเสี่ยงที่กำลังจะมาถึง" },
  s14: { rationale: "CIO มองตลาด selective overweight ใน quality equity ขณะที่ bond duration ยังคง neutral รอสัญญาณ Fed ที่ชัดขึ้นใน H2" },
  s15: { rationale: "เมื่อ Nvidia ทำสถิติรายได้ใหม่และ Jensen Huang บินตรงสู่ไทยก่อน Computex — Supercycle นี้ยังไม่หยุด ยังมี room ขึ้นอีก" },
  s16: { rationale: "ดีลสันติภาพ US-Iran กดสปอตน้ำมัน ขณะ SpaceX IPO พิสูจน์ว่าไม่ใช่แค่บริษัทจรวด — สองธีมที่เปลี่ยน portfolio allocation" },
  s17: { rationale: "หุ้นเกาหลีพุ่งนำโลกสัปดาห์นี้ ขณะพลังงานและทองคำโดนแรงขาย — สัญญาณ rotation ที่ชัดเจนที่สุดในรอบไตรมาส" },
  s18: { rationale: "IG spread แคบลงต่อเนื่อง ขณะที่ HY เริ่มแยกทาง — signal สำคัญที่ตลาดหุ้นมักจะตามมาใน 4–6 สัปดาห์" },
  s19: { rationale: "CIO ยืนยัน equity overweight ต่อ พร้อมส่งสัญญาณเริ่ม rotate เข้า EM ที่ valuation ยังถูกเมื่อเทียบกับ DM" },
  s20: { rationale: "ธนาคารกลางซื้อทองสูงสุดในรอบ 50 ปี — de-dollarisation ไม่ใช่ทฤษฎีอีกต่อไป แต่เป็นข้อมูลที่วัดได้และ price in ยังไม่เต็ม" },
  s21: { rationale: "พฤษภาคมปิดด้วย gold +4.2% นำโลก ขณะ EM bond ฟื้นตัวแรงหลัง Fed pause signal ชัด — positioning เริ่มเปลี่ยน" },
  s22: { rationale: "FDI เข้า India ทำสถิติ — Apple, Samsung, TSMC ต่างมาลงทุน manufacturing renaissance เพิ่งเริ่มและจะยาวนาน 10+ ปี" },
  s23: { rationale: "Beijing ปล่อย stimulus รอบสอง หลัง PMI ฟื้น — HK-listed tech เป็นจุดเข้าที่ดีที่สุดในรอบ 3 ปี valuation ถูกกว่า US tech 40%" },
  s24: { rationale: "Dollar อ่อนค่าลง ขณะ EM central bank ลด rate — FX carry ใน ASEAN ให้ yield เพิ่มเติม 2–3% ต่อปีโดยไม่รับ credit risk" },
  s25: { rationale: "AI ย่น timeline drug discovery จาก 10 ปีเหลือ 3 ปี — Big Pharma กำลัง hunt acquisition เพื่อเติม pipeline ราคา M&A premium สูงขึ้น" },
  s26: { rationale: "CIO คัดกรอง 5 กองทุนเด่นประจำเดือน ครอบคลุมทุก risk profile ตั้งแต่ conservative bond ถึง aggressive growth equity" },
  s27: { rationale: "Quantum milestone ใกล้มากกว่าที่คิด — thematic allocation เล็กๆ ให้ option value สูงมากในพอร์ต ความเสี่ยงจำกัดแต่ upside ไม่จำกัด" },
  s28: { rationale: "สัปดาห์ที่มี event สำคัญหนาแน่น — volatility อาจพุ่งสั้นๆ เป็นโอกาส rebalance และ add position ในจุดที่อ่อนตัว" },
  s29: { rationale: "ทองแดงเป็นโลหะแห่ง energy transition — EV + grid + AI data center สร้าง demand ที่ mine supply ตามไม่ทัน deficit ยาวถึงปี 2030" },
  s30: { rationale: "Soft landing, Re-acceleration หรือ Stagflation — 3 scenario พร้อม portfolio playbook สำหรับแต่ละกรณี ความน่าจะเป็นและ positioning ที่เหมาะสม" },
};

// ─── Types & helpers ──────────────────────────────────────────────────────────

type StrategyItem = (typeof mockHouseViewStrategies)[number] & {
  period: string;
  periodLabel: string;
  category: string;
};

function getCategory(strategy: (typeof mockHouseViewStrategies)[number]): string {
  return (strategy as unknown as { category: string }).category;
}

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
  return (
    <div className={`overflow-hidden flex h-full cursor-pointer hover:bg-muted/30 transition-colors ${noBorder ? "" : "rounded-2xl border border-border bg-card"}`}>
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

// ─── Compact Playbook Card ────────────────────────────────────────────────────

function PlaybookCardCompact({ strategy, noBorder }: { strategy: (typeof mockHouseViewStrategies)[number]; noBorder?: boolean }) {
  const cat = getCategory(strategy);
  return (
    <div className={`overflow-hidden flex w-full min-h-[116px] cursor-pointer hover:bg-muted/30 transition-colors ${noBorder ? "" : "rounded-2xl border border-border bg-card"}`}>
      <div className="w-1 shrink-0" style={{ background: CATEGORY_ACCENT_COLOR[cat] ?? "#6b7280" }} />
      <div className="flex-1 p-4 flex flex-col gap-2">
        <Tag text={cat} variant={CATEGORY_TAG_VARIANT[cat] ?? "gray"} size="small" />
        <p className="text-[14px] font-bold text-foreground leading-snug">{strategy.name}</p>
        {STRATEGY_DETAIL[strategy.id]?.rationale && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-1">
            {STRATEGY_DETAIL[strategy.id].rationale}
          </p>
        )}
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
                  {rest.slice(0, 3).map((s) => (
                    <PlaybookCardCompact key={s.id} strategy={s as (typeof mockHouseViewStrategies)[number]} />
                  ))}
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
    <div className="flex flex-col gap-5 sticky top-6">
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 flex flex-col items-center gap-3 text-center">
        <div className="size-10 rounded-xl bg-primary-action-light flex items-center justify-center">
          <SparkleIcon size={20} weight="fill" className="text-primary-action" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="type-subtitle-2 font-bold text-foreground">AI Recommend</p>
          <p className="type-caption text-muted-foreground leading-relaxed">AI-powered client matching and recommendations will appear here.</p>
        </div>
        <p className="text-[10px] font-semibold text-primary-action uppercase tracking-widest">Coming Soon</p>
      </div>
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

function Research4U() {
  const [activeCategory, setActiveCategory] = useState<string>("บทวิเคราะห์ทั้งหมด");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);

  const filtered = MOCK_R4U.filter((item) => {
    const catOk = activeCategory === "บทวิเคราะห์ทั้งหมด" || item.category === activeCategory;
    const dateOk = !searchDate || (() => {
      const d = searchDate.getDate().toString().padStart(2, "0");
      const m = (searchDate.getMonth() + 1).toString().padStart(2, "0");
      const y = (searchDate.getFullYear() + 543).toString();
      return item.date === `${d}/${m}/${y}`;
    })();
    return catOk && dateOk;
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col md:flex-row md:max-h-[72vh]">

      {/* Left sidebar — desktop */}
      <div className="hidden md:flex flex-col w-52 shrink-0 border-r border-border overflow-y-auto hide-scrollbar">
        {R4U_CATS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`text-left px-4 py-2.5 text-[13px] transition-colors border-b border-border/40 last:border-0 ${
              activeCategory === cat
                ? "bg-primary-action-light text-primary-action font-semibold"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">

        {/* Mobile filters */}
        <div className="md:hidden flex flex-col gap-2 p-3 border-b border-border shrink-0">
          <Dropdown
            value={activeCategory}
            onChange={setActiveCategory}
            options={R4U_CATS.map((c) => ({ label: c, value: c }))}
            placeholder="เลือกหมวดบทวิเคราะห์"
          />
          <DateInput
            mode="single"
            placeholder="เลือกวันที่"
            value={searchDate}
            onChange={setSearchDate}
            className="w-full"
          />
        </div>

        {/* Date filter — desktop only */}
        <div className="hidden md:block px-4 py-3 border-b border-border shrink-0">
          <DateInput
            mode="single"
            placeholder="เลือกวันที่"
            value={searchDate}
            onChange={setSearchDate}
            className="w-full md:w-56"
          />
        </div>

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
                href="#"
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
