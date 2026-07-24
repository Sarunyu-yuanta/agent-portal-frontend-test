"use client";

import { useState, type ReactNode } from "react";
import { Tag, Button, Chip, TabGroup, Modal } from "@sarunyu/system-one";
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

  const all = mockHouseViewStrategies as unknown as StrategyItem[];
  const filtered = filter === "All" ? all : all.filter((s) => s.category === filter);
  const isFiltered = filter !== "All";
  const groups = groupByPeriodLabel(filtered);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 flex-wrap">
        {ASSET_FILTERS.map((f) => (
          <Chip key={f} label={f} type="single" size="small" selected={filter === f} onClick={() => setFilter(f)} />
        ))}
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
                <span className="px-2.5 py-1 rounded bg-[var(--bg-brand-primary)] text-white text-[11px] font-bold">{periodBadge}</span>
                <p className="type-subtitle-1 font-bold text-foreground">{group.periodLabel}</p>
              </div>
              {hasMore && !isFirstMonthly && (
                <Button size="sm" variant="plain" rightIcon={<ArrowRightIcon size={12} />} onClick={() => setModalGroup(group)}>
                  ดูทั้งหมด
                </Button>
              )}
            </div>

            {isFirstMonthly ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col lg:flex-row">
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

      {modalGroup && (
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

const R4U_CATEGORIES = ["All", "Hot issue", "Buy list", "Asset performance", "Market calendar", "Asset class outlook", "Market outlook"] as const;
type R4UCategory = typeof R4U_CATEGORIES[number];

const CATEGORY_STYLE: Record<string, { pill: string; gradient: string }> = {
  "Hot issue":           { pill: "bg-red-50 text-red-600 border border-red-200",           gradient: "from-red-950/80 to-slate-900/80" },
  "Buy list":            { pill: "bg-green-50 text-green-700 border border-green-200",      gradient: "from-green-950/80 to-slate-900/80" },
  "Asset performance":   { pill: "bg-blue-50 text-blue-600 border border-blue-200",         gradient: "from-blue-950/80 to-slate-900/80" },
  "Market calendar":     { pill: "bg-purple-50 text-purple-600 border border-purple-200",   gradient: "from-purple-950/80 to-slate-900/80" },
  "Asset class outlook": { pill: "bg-teal-50 text-teal-600 border border-teal-200",         gradient: "from-teal-950/80 to-slate-900/80" },
  "Market outlook":      { pill: "bg-amber-50 text-amber-700 border border-amber-200",      gradient: "from-amber-950/80 to-slate-900/80" },
};

type R4UArticle = { id: string; category: R4UCategory; date: string; title: string; summary?: string };

const MONTHLY_FEATURED: R4UArticle = {
  id: "m1", category: "Hot issue", date: "1 ก.ค. 2569",
  title: "AI Capex Cycle: Semiconductor Equipment และ Memory Upcycle ยังไม่จบ — Supply Tight ลากยาวถึงปี 2028",
  summary: "Micron เซ็น SCA ครบ 16 ฉบับ ขณะที่ supply ยังตึงถึงปี 2028 — จังหวะนี้คือ valuation reset ไม่ใช่จุดจบ cycle",
};

const MONTHLY_LIST: R4UArticle[] = [
  { id: "m2", category: "Hot issue",        date: "1 ก.ค. 2569", title: "Inflation Inflection: Fed มีโอกาส 'คงดอกเบี้ย' มากกว่า 'ขึ้น' — กุญแจอยู่ที่กำไร ไม่ใช่ Yield ต่ำ" },
  { id: "m3", category: "Hot issue",        date: "1 ก.ค. 2569", title: "AI Demand กระจายสู่ Sovereign & Enterprise: 'ขาที่สาม' ของ AI CAPEX ที่ตลาดยังประเมินต่ำเกินไป" },
  { id: "m4", category: "Asset performance", date: "1 ก.ค. 2569", title: "ภาพรวมผลตอบแทนสินทรัพย์กรกฎาคม 2569 เดือนแห่ง Rotation และการละลาย Geopolitical Premium" },
];

const WEEKLY_ARTICLES: R4UArticle[] = [
  { id: "w1", category: "Hot issue",        date: "22 มิ.ย. 2569", title: "Fed ยุค Warsh: Bear Flattening ชัดขึ้น กับ Playbook ตราสารหนี้และพอร์ตการลงทุน",               summary: "เมื่อเฟดส่งสัญญาณขึ้นดอกเบี้ยลายปี Bear Flattening ยิ่งชัด และ Playbook ของพอร์ตต้องเปลี่ยนตาม" },
  { id: "w2", category: "Hot issue",        date: "22 มิ.ย. 2569", title: "AI Semiconductor Supply Chain เร่งตัว: HBM4E เร็วกว่าคาด Intel Foundry Turnaround",              summary: "HBM4E เข้าสู่รอบ qualification เร็วกว่าคาด ขณะที่ Intel Foundry turnaround และ BESI ยกเป้าปี 2030" },
  { id: "w3", category: "Hot issue",        date: "22 มิ.ย. 2569", title: "Regulator สหรัฐฯ เร่งสาย Time to Power: FERC และ ERCOT Batch Zero ออกกฎใหม่",                   summary: "FERC และ ERCOT ออกกฎใหม่ Time to Power สำหรับ AI data center ขนาดใหญ่ เพิ่ม visibility ต่อ capex" },
  { id: "w4", category: "Asset performance", date: "22 มิ.ย. 2569", title: "ภาพรวมผลตอบแทนสินทรัพย์สิ้นเดือนมิถุนายน 69",                                                  summary: "สัปดาห์แห่งความแตกต่าง หุ้นเกาหลีพุ่งนำโลก ขณะพลังงานและทองคำโดนแรงขาย" },
];

function CategoryPill({ category }: { category: R4UCategory }) {
  const style = CATEGORY_STYLE[category] ?? { pill: "bg-gray-100 text-gray-600 border border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.pill}`}>
      {category}
    </span>
  );
}

function ArticleImageBg({ category, children, className = "" }: { category: R4UCategory; children?: ReactNode; className?: string }) {
  const gradient = CATEGORY_STYLE[category]?.gradient ?? "from-slate-900/80 to-slate-800/80";
  return (
    <div className={`relative bg-slate-800 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        {children ?? <span className="text-white/70 text-[11px] font-semibold text-center">{category}</span>}
      </div>
    </div>
  );
}

function Research4U() {
  const [activeCategory, setActiveCategory] = useState<R4UCategory>("All");

  const filterArticles = (articles: R4UArticle[]) =>
    activeCategory === "All" ? articles : articles.filter((a) => a.category === activeCategory);

  const featuredVisible = activeCategory === "All" || MONTHLY_FEATURED.category === activeCategory;
  const monthlyList = filterArticles(MONTHLY_LIST);
  const weeklyList = filterArticles(WEEKLY_ARTICLES);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 flex-wrap">
        {R4U_CATEGORIES.map((cat) => (
          <Chip key={cat} label={cat} type="single" size="small" selected={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {(featuredVisible || monthlyList.length > 0) && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[var(--bg-brand-primary)] text-white text-[11px] font-bold">Monthly</span>
            <p className="type-subtitle-1 font-bold text-foreground">กรกฎาคม 2569</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {featuredVisible && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow">
                <ArticleImageBg category={MONTHLY_FEATURED.category} className="h-52">
                  <CategoryPill category={MONTHLY_FEATURED.category} />
                </ArticleImageBg>
                <div className="p-5 flex flex-col gap-3">
                  <p className="type-caption text-muted-foreground">{MONTHLY_FEATURED.date}</p>
                  <p className="type-subtitle-1 font-bold text-foreground leading-snug">{MONTHLY_FEATURED.title}</p>
                  {MONTHLY_FEATURED.summary && (
                    <p className="type-body-2 text-muted-foreground leading-relaxed">{MONTHLY_FEATURED.summary}</p>
                  )}
                  <button type="button" className="flex items-center gap-1 type-body-2 text-[var(--text-brand-primary)] font-semibold hover:underline self-start">
                    อ่านเพิ่มเติม <ArrowRightIcon size={13} />
                  </button>
                </div>
              </div>
            )}
            {monthlyList.length > 0 && (
              <div className="flex flex-col gap-3">
                {monthlyList.map((article) => (
                  <div key={article.id} className="rounded-2xl border border-border bg-card overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
                      <CategoryPill category={article.category} />
                      <p className="type-body-2 font-bold text-foreground leading-snug line-clamp-2">{article.title}</p>
                      <p className="type-caption text-muted-foreground">{article.date}</p>
                    </div>
                    <ArticleImageBg category={article.category} className="w-24 shrink-0 rounded-r-2xl" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {weeklyList.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[var(--bg-brand-primary)] text-white text-[11px] font-bold">Weekly</span>
            <p className="type-subtitle-1 font-bold text-foreground">22–26 มิถุนายน 2569</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyList.map((article) => (
              <div key={article.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow">
                <ArticleImageBg category={article.category} className="h-36">
                  <CategoryPill category={article.category} />
                </ArticleImageBg>
                <div className="p-3.5 flex flex-col gap-1.5">
                  <p className="type-caption text-muted-foreground">{article.date}</p>
                  <p className="type-caption font-bold text-foreground leading-snug line-clamp-3">{article.title}</p>
                  {article.summary && (
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3">{article.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <p className="type-body-2">Research 4U content coming soon.</p>
        </div>
      )}
    </div>
  );
}
