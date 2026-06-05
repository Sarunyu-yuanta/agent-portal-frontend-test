export const mockClients = [
  { id: "1", name: "Somchai Rattanakul", tier: "UHNW", aum: "฿ 450M", cashIdlePct: 18, plYtd: "+12.4%", plPositive: true, aiScore: 94, status: "success" as const, lastContact: "2 days ago", riskProfile: "Aggressive" },
  { id: "2", name: "Malee Pongpipat", tier: "HNW", aum: "฿ 180M", cashIdlePct: 32, plYtd: "-3.1%", plPositive: false, aiScore: 87, status: "error" as const, lastContact: "1 week ago", riskProfile: "Moderate" },
  { id: "3", name: "Pravit Suwannarat", tier: "HNW", aum: "฿ 95M", cashIdlePct: 8, plYtd: "+7.2%", plPositive: true, aiScore: 72, status: "success" as const, lastContact: "3 days ago", riskProfile: "Conservative" },
  { id: "4", name: "Nattaporn Chaiwong", tier: "UHNW", aum: "฿ 620M", cashIdlePct: 25, plYtd: "+15.8%", plPositive: true, aiScore: 91, status: "hold" as const, lastContact: "Today", riskProfile: "Aggressive" },
  { id: "5", name: "Wichai Thongkam", tier: "HNW", aum: "฿ 130M", cashIdlePct: 41, plYtd: "-1.5%", plPositive: false, aiScore: 65, status: "error" as const, lastContact: "2 weeks ago", riskProfile: "Moderate" },
  { id: "6", name: "Siriporn Ladawan", tier: "HNW", aum: "฿ 75M", cashIdlePct: 12, plYtd: "+4.9%", plPositive: true, aiScore: 78, status: "success" as const, lastContact: "5 days ago", riskProfile: "Conservative" },
  { id: "7", name: "Thanawat Boonmee", tier: "UHNW", aum: "฿ 890M", cashIdlePct: 15, plYtd: "+22.1%", plPositive: true, aiScore: 96, status: "processing" as const, lastContact: "Yesterday", riskProfile: "Aggressive" },
  { id: "8", name: "Kannika Srisuphan", tier: "HNW", aum: "฿ 220M", cashIdlePct: 28, plYtd: "+6.3%", plPositive: true, aiScore: 83, status: "success" as const, lastContact: "4 days ago", riskProfile: "Moderate" },
];

export const mockNBAActions = [
  {
    id: "1",
    clientName: "Somchai Rattanakul",
    tier: "UHNW",
    priority: "HIGH",
    priorityVariant: "red" as const,
    insight: "฿ 81M idle cash (18% of portfolio) — underperforming by 220bps vs target allocation.",
    aiDraft: "คุณสมชาย สวัสดีครับ ผมสังเกตว่าพอร์ตของคุณมีเงินสด 18% ซึ่งสูงกว่าเป้าหมาย ผมมีโอกาสการลงทุนใน Structured Note ที่น่าสนใจสำหรับคุณครับ",
    action: "Review & Send",
    revenueImpact: "฿ 2.4M est. revenue",
  },
  {
    id: "2",
    clientName: "Malee Pongpipat",
    tier: "HNW",
    priority: "HIGH",
    priorityVariant: "red" as const,
    insight: "KYC expires in 14 days. Portfolio shows -3.1% YTD — review required to prevent suitability breach.",
    aiDraft: "คุณมาลี สวัสดีค่ะ ครบกำหนดการต่ออายุ KYC ของคุณในอีก 14 วัน ขอนัดหมายเพื่ออัปเดตข้อมูลและทบทวนพอร์ตครับ",
    action: "Schedule Review",
    revenueImpact: "Compliance Risk",
  },
  {
    id: "3",
    clientName: "Nattaporn Chaiwong",
    tier: "UHNW",
    priority: "MEDIUM",
    priorityVariant: "yellow" as const,
    insight: "New Structured Note (6-month tenor, 8.5% p.a.) — AI matched 3 UHNW clients. Best fit: Nattaporn.",
    aiDraft: "คุณณัฐพร สวัสดีครับ มี Structured Note รุ่นใหม่ที่ตรงกับ Risk Profile ของคุณมาก โอกาสดีที่หาได้ยากครับ",
    action: "Pitch Product",
    revenueImpact: "฿ 1.8M est. revenue",
  },
  {
    id: "4",
    clientName: "Wichai Thongkam",
    tier: "HNW",
    priority: "LOW",
    priorityVariant: "blue" as const,
    insight: "No contact in 14 days. Engagement score dropped 22 points. Re-engage with market update.",
    aiDraft: "คุณวิชัย สวัสดีครับ ตลาดหุ้นไทยมีสัญญาณน่าสนใจสัปดาห์นี้ อยากนัดคุยเพื่ออัปเดตสถานการณ์ครับ",
    action: "Re-engage",
    revenueImpact: "฿ 0.5M est. revenue",
  },
];

export const mockMiniKanban = [
  { id: "k1", client: "Somchai R.", deal: "Structured Note ฿50M", stage: "Pitch" },
  { id: "k2", client: "Nattaporn C.", deal: "Equity Fund ฿120M", stage: "Client Review" },
  { id: "k3", client: "Thanawat B.", deal: "Bond Portfolio ฿200M", stage: "Executed" },
  { id: "k4", client: "Kannika S.", deal: "DCA Fund ฿30M", stage: "Idea" },
];

export const mockPipelineDeals = [
  { id: "p1", client: "Somchai Rattanakul", product: "Structured Note", dealSize: "฿ 50M", probability: 85, stage: "Proposed", daysInStage: 5, stalled: false },
  { id: "p2", client: "Nattaporn Chaiwong", product: "Global Equity Fund", dealSize: "฿ 120M", probability: 72, stage: "Under Review", daysInStage: 12, stalled: false },
  { id: "p3", client: "Thanawat Boonmee", product: "Bond Portfolio", dealSize: "฿ 200M", probability: 91, stage: "Negotiation", daysInStage: 8, stalled: false },
  { id: "p4", client: "Kannika Srisuphan", product: "DCA Equity Fund", dealSize: "฿ 30M", probability: 45, stage: "Qualified", daysInStage: 3, stalled: false },
  { id: "p5", client: "Pravit Suwannarat", product: "REITs", dealSize: "฿ 25M", probability: 60, stage: "Proposed", daysInStage: 18, stalled: true },
  { id: "p6", client: "Siriporn Ladawan", product: "Fixed Income", dealSize: "฿ 40M", probability: 78, stage: "Under Review", daysInStage: 7, stalled: false },
  { id: "p7", client: "Malee Pongpipat", product: "Structured Note", dealSize: "฿ 60M", probability: 55, stage: "Qualified", daysInStage: 2, stalled: false },
  { id: "p8", client: "Wichai Thongkam", product: "Bond", dealSize: "฿ 45M", probability: 30, stage: "Qualified", daysInStage: 25, stalled: true },
  { id: "p9", client: "Thanawat Boonmee", product: "Hedge Fund", dealSize: "฿ 150M", probability: 95, stage: "Closed Won", daysInStage: 0, stalled: false },
  { id: "p10", client: "Somchai Rattanakul", product: "Private Credit", dealSize: "฿ 80M", probability: 0, stage: "Closed Lost", daysInStage: 0, stalled: false },
];

export const mockInsights = [
  { id: "i1", type: "Product Match", clientName: "Somchai Rattanakul", tier: "UHNW", insight: "High idle cash (18%) — ideal candidate for 6-month Structured Note yielding 8.5% p.a.", confidence: 94, revenueImpact: "฿ 2.4M", category: "Product Match" },
  { id: "i2", type: "Risk Alert", clientName: "Malee Pongpipat", tier: "HNW", insight: "Portfolio concentration risk: 65% in single equity sector. Recommend diversification review.", confidence: 88, revenueImpact: "Risk Reduction", category: "Risk Alert" },
  { id: "i3", type: "Engagement", clientName: "Wichai Thongkam", tier: "HNW", insight: "No contact in 14 days. Engagement score dropped from 82 to 60. Re-engagement opportunity.", confidence: 75, revenueImpact: "฿ 0.5M", category: "Engagement" },
  { id: "i4", type: "Product Match", clientName: "Nattaporn Chaiwong", tier: "UHNW", insight: "Strong cash flow profile — Global Private Equity fund at target allocation ceiling.", confidence: 91, revenueImpact: "฿ 3.2M", category: "Product Match" },
  { id: "i5", type: "Risk Alert", clientName: "Pravit Suwannarat", tier: "HNW", insight: "Bond allocation 78% — duration risk elevated. Market rate sensitivity at critical threshold.", confidence: 82, revenueImpact: "Risk Reduction", category: "Risk Alert" },
  { id: "i6", type: "Engagement", clientName: "Siriporn Ladawan", tier: "HNW", insight: "Birthday in 7 days — high engagement moment. Personalized market outlook recommended.", confidence: 70, revenueImpact: "฿ 0.8M", category: "Engagement" },
  { id: "i7", type: "Product Match", clientName: "Kannika Srisuphan", tier: "HNW", insight: "ESG fund launch aligned with client's stated preference for sustainable investing.", confidence: 86, revenueImpact: "฿ 1.1M", category: "Product Match" },
  { id: "i8", type: "Portfolio", clientName: "Thanawat Boonmee", tier: "UHNW", insight: "FX exposure at 42% — currency hedging opportunity before US rate decision next week.", confidence: 79, revenueImpact: "฿ 1.5M", category: "Portfolio" },
];

export const mockComplianceAlerts = [
  { id: "c1", type: "critical" as const, title: "Unsuitable Trade Blocked", client: "Malee Pongpipat", message: "High-risk product (Risk Score 5) proposed for Conservative profile (Risk Score 2). Trade blocked pending override authorization.", action1: "Maintain Block", action2: "Request Override" },
  { id: "c2", type: "critical" as const, title: "Sanctions Match", client: "Unknown — Pending Verification", message: "Adverse media screening returned a partial name match. Account activity suspended pending compliance review.", action1: "Escalate to Compliance", action2: null },
  { id: "c3", type: "warning" as const, title: "Missing Source of Wealth", client: "Wichai Thongkam", message: "Source of wealth documentation not received. Account limit reduced to ฿ 10M until documentation is submitted.", action1: "Request via Portal", action2: null },
  { id: "c4", type: "warning" as const, title: "KYC Expiry — 14 Days", client: "Malee Pongpipat", message: "KYC review due 2026-06-11. Client has been notified. Pending document upload.", action1: "Send Reminder", action2: null },
];

export const mockKYCData = [
  { id: "k1", client: "Somchai Rattanakul", riskRating: "High", kycStatus: "success" as const, nextReview: "2026-12-15", daysUntilExpiry: 201 },
  { id: "k2", client: "Malee Pongpipat", riskRating: "Medium", kycStatus: "error" as const, nextReview: "2026-06-11", daysUntilExpiry: 14 },
  { id: "k3", client: "Pravit Suwannarat", riskRating: "Low", kycStatus: "success" as const, nextReview: "2027-01-20", daysUntilExpiry: 237 },
  { id: "k4", client: "Nattaporn Chaiwong", riskRating: "High", kycStatus: "processing" as const, nextReview: "2026-08-30", daysUntilExpiry: 94 },
  { id: "k5", client: "Wichai Thongkam", riskRating: "Medium", kycStatus: "hold" as const, nextReview: "2026-06-05", daysUntilExpiry: 8 },
  { id: "k6", client: "Siriporn Ladawan", riskRating: "Low", kycStatus: "success" as const, nextReview: "2026-11-10", daysUntilExpiry: 166 },
  { id: "k7", client: "Thanawat Boonmee", riskRating: "High", kycStatus: "success" as const, nextReview: "2027-03-01", daysUntilExpiry: 277 },
];

export const mockHouseViewStrategies = [
  {
    id: "s1",
    name: "Asia ex-Japan Equity — Selective Growth",
    conviction: "High",
    convictionVariant: "green" as const,
    targetAllocation: "20–25%",
    pitchHook: "Earnings recovery in tech/financials sector with AI-driven productivity tailwinds.",
    products: ["Thailand Equity Fund A", "Asia Growth ETF", "HK Tech Sector Fund"],
    matchedClients: 8,
    assetClass: "Equity",
  },
  {
    id: "s2",
    name: "Short-Duration Investment Grade Bond",
    conviction: "Medium",
    convictionVariant: "yellow" as const,
    targetAllocation: "15–20%",
    pitchHook: "Rate cycle peak — lock in 5–6% yield before cuts. Capital preservation with income.",
    products: ["IG Corporate Bond Fund", "Short Duration Bond ETF"],
    matchedClients: 12,
    assetClass: "Fixed Income",
  },
  {
    id: "s3",
    name: "Structured Note — Capital Protected 8.5%",
    conviction: "High",
    convictionVariant: "green" as const,
    targetAllocation: "5–10%",
    pitchHook: "100% capital protection + 8.5% p.a. coupon. Ideal for idle cash redeployment.",
    products: ["6-Month Structured Note Series 12"],
    matchedClients: 5,
    assetClass: "Alternatives",
  },
  {
    id: "s4",
    name: "Global REITs — Dividend Income",
    conviction: "Low",
    convictionVariant: "red" as const,
    targetAllocation: "5–8%",
    pitchHook: "Sector under pressure from rates. Selective exposure only — quality assets in logistics/data centers.",
    products: ["Global REITs Fund", "Logistics REIT ETF"],
    matchedClients: 3,
    assetClass: "Real Estate",
  },
];

export const mockPerformanceData = {
  revenueYtd: { value: "฿ 24.2M", target: "฿ 30.0M", progress: 81, status: "Lagging" as const },
  aumGrowth: { value: "+8.4%", target: "+10.0%", progress: 84, status: "Lagging" as const },
  netNewMoney: { value: "฿ 180M", target: "฿ 200M", progress: 90, status: "On Track" as const },
  productPenetration: { value: "2.4", target: "3.0", progress: 80, status: "Lagging" as const },
  overallGrade: "B+",
  incomeByProduct: [
    { product: "Equity Funds", revenue: 8.4, target: 10.0 },
    { product: "Fixed Income", revenue: 6.2, target: 7.5 },
    { product: "Structured Notes", revenue: 5.8, target: 6.0 },
    { product: "REITs", revenue: 2.1, target: 3.5 },
    { product: "Alternatives", revenue: 1.7, target: 3.0 },
  ],
  aiActionPlan: [
    "Close 2 pending Structured Note proposals (฿ 110M combined) — highest probability 85%/78%.",
    "Re-engage Wichai Thongkam — ฿ 45M bond proposal stalled 25 days.",
    "Pitch Asia Equity Fund to 3 UHNW clients in Q2 strategy session.",
    "Resolve KYC expiry for Malee Pongpipat to unlock ฿ 60M proposal.",
  ],
};

type AllocationSlice = { name: string; value: number; fill: string };
type AllocationKpi = { label: string; value: string; ytd: string; ytdPositive: boolean; warning?: string };
type Holding = { asset: string; value: string; pnl: string; pnlPct: string; positive: boolean; pct: string };
type AIAlert = { title: string; message: string; primaryAction: string; secondaryAction: string };

export type ClientDetail = {
  allocationData: AllocationSlice[];
  allocationBreakdown: AllocationKpi[];
  topHoldings: Holding[];
  behavioralProfile: { label: string; value: string }[];
  tasks: { id: string; done: boolean; task: string; urgent: boolean }[];
  recentActivity: { label: string; description: string; date: string; dotColor: string }[];
  aiHighPriority: AIAlert | null;
  aiRiskAlert: { title: string; message: string; action: string } | null;
};

export const mockClientDetails: Record<string, ClientDetail> = {
  "1": {
    allocationData: [
      { name: "Thai Equity", value: 35, fill: "#3b82f6" },
      { name: "Fixed Income", value: 28, fill: "#8b5cf6" },
      { name: "Global Equity", value: 19, fill: "#10b981" },
      { name: "Cash / MMF", value: 18, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "PTT PCL", value: "฿ 85M", pnl: "+฿ 12.4M", pnlPct: "+17.1%", positive: true, pct: "18.9%" },
      { asset: "BBL Equity Fund", value: "฿ 63M", pnl: "+฿ 4.1M", pnlPct: "+7.0%", positive: true, pct: "14.0%" },
      { asset: "Thai Gov Bond 2028", value: "฿ 52M", pnl: "-฿ 1.2M", pnlPct: "-2.3%", positive: false, pct: "11.6%" },
      { asset: "Apple Inc (AAPL)", value: "฿ 47M", pnl: "+฿ 8.9M", pnlPct: "+23.4%", positive: true, pct: "10.4%" },
      { asset: "Cash / MMF", value: "฿ 81M", pnl: "฿ 0", pnlPct: "0.0%", positive: true, pct: "18.0%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "In-person + WhatsApp" },
      { label: "Product Preference", value: "Structured Products" },
      { label: "Trade Frequency", value: "Monthly" },
      { label: "AI Observation", value: "Responds to yield-focused pitches" },
    ],
    tasks: [
      { id: "t1-1", done: false, task: "KYC renewal form — due Jun 11", urgent: true },
      { id: "t1-2", done: false, task: "Q2 portfolio review meeting", urgent: false },
      { id: "t1-3", done: true, task: "Annual risk profile update", urgent: false },
    ],
    recentActivity: [
      { label: "Called — discussed Q2 portfolio", description: "Reviewed tech sector exposure. Client requested FX hedging options.", date: "May 26", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Proposal sent — Structured Note ฿50M", description: "AI-drafted proposal emailed for client review.", date: "May 22", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "KYC reminder sent via email", description: "Automated notification for upcoming renewal.", date: "May 20", dotColor: "bg-[var(--bg-warning-primary)]" },
      { label: "Portfolio review completed", description: "Q1 allocation targets met. No rebalancing needed.", date: "May 15", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Revenue Opportunity",
      message: "฿ 81M idle cash (18% of portfolio) — 220bps below target allocation yield. AI recommends Structured Note pitch (8.5% p.a.) for immediate redeployment.",
      primaryAction: "Draft Pitch",
      secondaryAction: "Dismiss",
    },
    aiRiskAlert: {
      title: "RISK ALERT — Portfolio Review Overdue",
      message: "Portfolio rebalancing overdue by 45 days. Equity drift +8% above target. Suitability alignment check recommended.",
      action: "Simulate Rebalance",
    },
    allocationBreakdown: [
      { label: "Thai Equity", value: "฿ 157M", ytd: "+12.4%", ytdPositive: true },
      { label: "Fixed Income", value: "฿ 126M", ytd: "-1.8%", ytdPositive: false },
      { label: "Global Equity", value: "฿ 85M", ytd: "+15.6%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 81M", ytd: "+0.5%", ytdPositive: true, warning: "18% — above 10% target" },
    ],
  },

  "2": {
    allocationData: [
      { name: "Thai Equity", value: 28, fill: "#3b82f6" },
      { name: "Fixed Income", value: 40, fill: "#8b5cf6" },
      { name: "Cash / MMF", value: 32, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "IG Corporate Bond Fund", value: "฿ 42M", pnl: "-฿ 2.1M", pnlPct: "-4.8%", positive: false, pct: "23.3%" },
      { asset: "SET50 ETF", value: "฿ 28M", pnl: "-฿ 1.8M", pnlPct: "-6.0%", positive: false, pct: "15.6%" },
      { asset: "Thai Gov Bond 2030", value: "฿ 30M", pnl: "+฿ 0.4M", pnlPct: "+1.3%", positive: true, pct: "16.7%" },
      { asset: "Money Market Fund", value: "฿ 22M", pnl: "+฿ 0.3M", pnlPct: "+1.4%", positive: true, pct: "12.2%" },
      { asset: "Cash (Idle)", value: "฿ 58M", pnl: "฿ 0", pnlPct: "0.0%", positive: true, pct: "32.2%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "Email + Phone" },
      { label: "Product Preference", value: "Fixed Income + Mutual Funds" },
      { label: "Trade Frequency", value: "Quarterly" },
      { label: "AI Observation", value: "Risk-averse; prefers capital protection" },
    ],
    tasks: [
      { id: "t2-1", done: false, task: "KYC renewal — expires Jun 11 (URGENT)", urgent: true },
      { id: "t2-2", done: false, task: "Portfolio loss review — suitability check", urgent: true },
      { id: "t2-3", done: false, task: "Source of wealth documentation", urgent: false },
    ],
    recentActivity: [
      { label: "KYC Renewal Reminder Sent", description: "Automated email sent for upcoming KYC expiry.", date: "Jun 1", dotColor: "bg-[var(--bg-warning-primary)]" },
      { label: "Compliance Alert Triggered", description: "Missing Source of Wealth flag raised by compliance system.", date: "May 28", dotColor: "bg-[var(--bg-danger-primary)]" },
      { label: "Phone Call", description: "Brief check-in. Client asked about bond market outlook.", date: "May 20", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Monthly Statement Sent", description: "Automated May statement delivered via email.", date: "May 1", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — KYC Expiry in 14 Days",
      message: "KYC review due Jun 11. Client not yet responded. Failure to renew will restrict account activity and block ฿ 60M pending proposal.",
      primaryAction: "Schedule Review",
      secondaryAction: "Send Reminder",
    },
    aiRiskAlert: {
      title: "RISK ALERT — Portfolio Loss & Suitability",
      message: "Portfolio down -3.1% YTD. Cash at 32% — significantly above 15% Moderate target. Immediate rebalancing consultation recommended.",
      action: "Review Suitability",
    },
    allocationBreakdown: [
      { label: "Thai Equity", value: "฿ 50M", ytd: "-6.0%", ytdPositive: false },
      { label: "Fixed Income", value: "฿ 72M", ytd: "+1.3%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 58M", ytd: "+0.3%", ytdPositive: true, warning: "32% — above 15% target" },
    ],
  },

  "3": {
    allocationData: [
      { name: "Fixed Income", value: 55, fill: "#8b5cf6" },
      { name: "Thai Equity", value: 30, fill: "#3b82f6" },
      { name: "REITs", value: 7, fill: "#f97316" },
      { name: "Cash / MMF", value: 8, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "Short Duration Bond ETF", value: "฿ 30M", pnl: "+฿ 1.8M", pnlPct: "+6.4%", positive: true, pct: "31.6%" },
      { asset: "IG Corporate Bond Fund", value: "฿ 22M", pnl: "+฿ 1.1M", pnlPct: "+5.3%", positive: true, pct: "23.2%" },
      { asset: "SET50 ETF", value: "฿ 15M", pnl: "+฿ 0.9M", pnlPct: "+6.4%", positive: true, pct: "15.8%" },
      { asset: "Global REITs Fund", value: "฿ 6.5M", pnl: "-฿ 0.3M", pnlPct: "-4.4%", positive: false, pct: "6.8%" },
      { asset: "Cash / MMF", value: "฿ 7.6M", pnl: "+฿ 0.1M", pnlPct: "+1.3%", positive: true, pct: "8.0%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "Email only" },
      { label: "Product Preference", value: "Fixed Income + REITs" },
      { label: "Trade Frequency", value: "Semi-annual" },
      { label: "AI Observation", value: "Values stability; rarely switches products" },
    ],
    tasks: [
      { id: "t3-1", done: false, task: "Annual review meeting — book for Jun", urgent: false },
      { id: "t3-2", done: true, task: "Bond ladder rebalancing completed", urgent: false },
      { id: "t3-3", done: false, task: "Pitch REITs diversification opportunity", urgent: false },
    ],
    recentActivity: [
      { label: "Monthly Statement Viewed", description: "Client accessed May statement via portal.", date: "Jun 1", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Bond Ladder Rebalancing", description: "Executed per client instruction. New duration: 3.2 years.", date: "May 18", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Annual Review Email Sent", description: "Pre-meeting summary of portfolio performance.", date: "May 10", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
      { label: "Product Brochure Opened", description: "Client opened REITs fund brochure — high engagement.", date: "Apr 28", dotColor: "bg-[var(--bg-brand-primary)]" },
    ],
    aiHighPriority: null,
    aiRiskAlert: {
      title: "RISK ALERT — REITs Sector Pressure",
      message: "REITs allocation down -4.4% YTD. Global rate environment may extend underperformance. Consider reducing to target 5% allocation.",
      action: "Review REITs Exposure",
    },
    allocationBreakdown: [
      { label: "Fixed Income", value: "฿ 52M", ytd: "+5.8%", ytdPositive: true },
      { label: "Thai Equity", value: "฿ 28M", ytd: "+6.4%", ytdPositive: true },
      { label: "REITs", value: "฿ 6.7M", ytd: "-4.4%", ytdPositive: false },
      { label: "Cash / MMF", value: "฿ 7.6M", ytd: "+1.3%", ytdPositive: true },
    ],
  },

  "4": {
    allocationData: [
      { name: "Global Equity", value: 42, fill: "#10b981" },
      { name: "Thai Equity", value: 28, fill: "#3b82f6" },
      { name: "Fixed Income", value: 15, fill: "#8b5cf6" },
      { name: "Alternatives", value: 10, fill: "#f97316" },
      { name: "Cash / MMF", value: 5, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "Nvidia Corp (NVDA)", value: "฿ 124M", pnl: "+฿ 48.2M", pnlPct: "+63.4%", positive: true, pct: "20.0%" },
      { asset: "Asia Growth ETF", value: "฿ 93M", pnl: "+฿ 14.1M", pnlPct: "+17.9%", positive: true, pct: "15.0%" },
      { asset: "Private Equity Fund III", value: "฿ 62M", pnl: "+฿ 8.9M", pnlPct: "+16.8%", positive: true, pct: "10.0%" },
      { asset: "Structured Note Series 11", value: "฿ 55M", pnl: "+฿ 4.7M", pnlPct: "+9.4%", positive: true, pct: "8.9%" },
      { asset: "Cash / MMF", value: "฿ 31M", pnl: "+฿ 0.4M", pnlPct: "+1.3%", positive: true, pct: "5.0%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "In-person (prefers office meetings)" },
      { label: "Product Preference", value: "Global Equity + Alternatives" },
      { label: "Trade Frequency", value: "Bi-weekly" },
      { label: "AI Observation", value: "High conviction; fast decision maker" },
    ],
    tasks: [
      { id: "t4-1", done: false, task: "Pitch Structured Note Series 12 (8.5%)", urgent: false },
      { id: "t4-2", done: false, task: "Q3 strategy session — book venue", urgent: false },
      { id: "t4-3", done: true, task: "Rebalancing to reduce equity overweight", urgent: false },
    ],
    recentActivity: [
      { label: "Structured Note Pitch", description: "Presented Series 12. Client interested, requested term sheet.", date: "Jun 1", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Portfolio Rebalancing Executed", description: "Reduced Global Equity from 48% to 42% per target.", date: "May 24", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Q2 Review Meeting", description: "In-office session. Discussed AI sector outlook.", date: "May 15", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Private Equity Commitment", description: "Client committed ฿ 62M to PE Fund III. Wire received.", date: "May 5", dotColor: "bg-[var(--bg-brand-primary)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Product Match: Series 12",
      message: "Structured Note Series 12 (8.5% p.a., 6-month) matched to Nattaporn's risk profile. AI confidence: 91%. Idle cash ฿ 31M available for immediate deployment.",
      primaryAction: "Pitch Product",
      secondaryAction: "Dismiss",
    },
    aiRiskAlert: null,
    allocationBreakdown: [
      { label: "Global Equity", value: "฿ 260M", ytd: "+22.1%", ytdPositive: true },
      { label: "Thai Equity", value: "฿ 174M", ytd: "+15.4%", ytdPositive: true },
      { label: "Fixed Income", value: "฿ 93M", ytd: "+3.8%", ytdPositive: true },
      { label: "Alternatives", value: "฿ 62M", ytd: "+16.8%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 31M", ytd: "+1.3%", ytdPositive: true },
    ],
  },

  "5": {
    allocationData: [
      { name: "Thai Equity", value: 50, fill: "#3b82f6" },
      { name: "Fixed Income", value: 22, fill: "#8b5cf6" },
      { name: "Cash / MMF", value: 28, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "SET50 ETF", value: "฿ 38M", pnl: "-฿ 2.6M", pnlPct: "-6.4%", positive: false, pct: "29.2%" },
      { asset: "BBL Equity Fund", value: "฿ 27M", pnl: "-฿ 0.8M", pnlPct: "-2.9%", positive: false, pct: "20.8%" },
      { asset: "IG Corporate Bond", value: "฿ 29M", pnl: "+฿ 0.6M", pnlPct: "+2.1%", positive: true, pct: "22.3%" },
      { asset: "Money Market Fund", value: "฿ 18M", pnl: "+฿ 0.2M", pnlPct: "+1.1%", positive: true, pct: "13.8%" },
      { asset: "Cash (Idle)", value: "฿ 18M", pnl: "฿ 0", pnlPct: "0.0%", positive: true, pct: "13.8%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "LINE + Phone" },
      { label: "Product Preference", value: "Equity Funds" },
      { label: "Trade Frequency", value: "Irregular" },
      { label: "AI Observation", value: "Disengaged; responds to market alerts" },
    ],
    tasks: [
      { id: "t5-1", done: false, task: "Re-engage — call to discuss market outlook", urgent: true },
      { id: "t5-2", done: false, task: "Missing Source of Wealth documentation", urgent: false },
      { id: "t5-3", done: false, task: "DCA Equity Fund pitch", urgent: false },
    ],
    recentActivity: [
      { label: "No Recent Contact", description: "Last engagement 14 days ago — engagement score -22 points.", date: "May 19", dotColor: "bg-[var(--bg-danger-primary)]" },
      { label: "Product Brochure Opened", description: "Client opened Bond Fund brochure sent via LINE.", date: "May 15", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Portfolio Alert Sent", description: "Thai Equity down -6.4% vs benchmark alert.", date: "May 10", dotColor: "bg-[var(--bg-warning-primary)]" },
      { label: "Last Phone Call", description: "Brief check-in. Client requested callback.", date: "May 5", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Re-engage Client",
      message: "No contact in 14 days. Engagement score 82 → 60. Client has ฿ 36M idle cash (28%). Market recovery narrative is the ideal re-engagement hook.",
      primaryAction: "Call Now",
      secondaryAction: "Send Market Update",
    },
    aiRiskAlert: {
      title: "RISK ALERT — Thai Equity Concentration",
      message: "50% in Thai Equity vs 35% Moderate target. YTD -1.5% underperformance. Rebalancing to Fixed Income advisable before further drawdown.",
      action: "Propose Rebalancing",
    },
    allocationBreakdown: [
      { label: "Thai Equity", value: "฿ 65M", ytd: "-1.5%", ytdPositive: false },
      { label: "Fixed Income", value: "฿ 29M", ytd: "+2.1%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 36M", ytd: "+0.3%", ytdPositive: true, warning: "28% — above 15% target" },
    ],
  },

  "6": {
    allocationData: [
      { name: "Fixed Income", value: 48, fill: "#8b5cf6" },
      { name: "Thai Equity", value: 40, fill: "#3b82f6" },
      { name: "Cash / MMF", value: 12, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "IG Corporate Bond Fund", value: "฿ 22M", pnl: "+฿ 1.2M", pnlPct: "+5.8%", positive: true, pct: "29.3%" },
      { asset: "Short Duration Bond ETF", value: "฿ 14M", pnl: "+฿ 0.6M", pnlPct: "+4.5%", positive: true, pct: "18.7%" },
      { asset: "SET50 ETF", value: "฿ 18M", pnl: "+฿ 1.5M", pnlPct: "+9.1%", positive: true, pct: "24.0%" },
      { asset: "Dividend Stock Fund", value: "฿ 12M", pnl: "+฿ 0.4M", pnlPct: "+3.4%", positive: true, pct: "16.0%" },
      { asset: "Cash / MMF", value: "฿ 9M", pnl: "+฿ 0.1M", pnlPct: "+1.1%", positive: true, pct: "12.0%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "Email + quarterly calls" },
      { label: "Product Preference", value: "Fixed Income + Dividend Stocks" },
      { label: "Trade Frequency", value: "Quarterly" },
      { label: "AI Observation", value: "Loyal; responds well to income-focused pitch" },
    ],
    tasks: [
      { id: "t6-1", done: false, task: "Birthday contact — Jun 9 (3 days away)", urgent: true },
      { id: "t6-2", done: false, task: "Fixed Income upsell proposal review", urgent: false },
      { id: "t6-3", done: true, task: "Q1 portfolio review completed", urgent: false },
    ],
    recentActivity: [
      { label: "Fixed Income Proposal Sent", description: "Emailed ฿ 40M Fixed Income upsell proposal.", date: "Jun 1", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Video Call", description: "Discussed interest rates and bond ladder strategy.", date: "May 22", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Market Outlook Email", description: "Sent personalized bond market update.", date: "May 10", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
      { label: "Q1 Portfolio Review", description: "Conservative allocation performing well; client satisfied.", date: "Apr 15", dotColor: "bg-[var(--bg-success-primary)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Birthday Engagement",
      message: "Client's birthday Jun 9 — 3 days away. High engagement moment. AI recommends personalized market note + ฿ 40M Fixed Income proposal follow-up.",
      primaryAction: "Send Personal Note",
      secondaryAction: "Dismiss",
    },
    aiRiskAlert: null,
    allocationBreakdown: [
      { label: "Fixed Income", value: "฿ 36M", ytd: "+5.2%", ytdPositive: true },
      { label: "Thai Equity", value: "฿ 30M", ytd: "+7.8%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 9M", ytd: "+1.1%", ytdPositive: true },
    ],
  },

  "7": {
    allocationData: [
      { name: "Global Equity", value: 50, fill: "#10b981" },
      { name: "Thai Equity", value: 28, fill: "#3b82f6" },
      { name: "Alternatives", value: 10, fill: "#f97316" },
      { name: "Fixed Income", value: 7, fill: "#8b5cf6" },
      { name: "Cash / MMF", value: 5, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "Microsoft Corp (MSFT)", value: "฿ 178M", pnl: "+฿ 52.4M", pnlPct: "+41.7%", positive: true, pct: "20.0%" },
      { asset: "Asia Growth ETF", value: "฿ 133M", pnl: "+฿ 23.1M", pnlPct: "+21.0%", positive: true, pct: "14.9%" },
      { asset: "Hedge Fund Series A", value: "฿ 89M", pnl: "+฿ 14.7M", pnlPct: "+19.8%", positive: true, pct: "10.0%" },
      { asset: "PTT PCL", value: "฿ 71M", pnl: "+฿ 9.3M", pnlPct: "+15.1%", positive: true, pct: "8.0%" },
      { asset: "Cash / MMF", value: "฿ 44.5M", pnl: "+฿ 0.6M", pnlPct: "+1.3%", positive: true, pct: "5.0%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "In-person + golf outings" },
      { label: "Product Preference", value: "Global Equity + Hedge Funds" },
      { label: "Trade Frequency", value: "Weekly" },
      { label: "AI Observation", value: "Trophy client; strong referral potential" },
    ],
    tasks: [
      { id: "t7-1", done: false, task: "Referral follow-up — 2 HNW prospects by Jun 15", urgent: false },
      { id: "t7-2", done: false, task: "Year-end tax optimization discussion", urgent: false },
      { id: "t7-3", done: true, task: "Hedge Fund commitment ฿ 150M executed", urgent: false },
    ],
    recentActivity: [
      { label: "Referral Discussion", description: "Client agreed to refer 2 colleagues. RM to follow up by Jun 15.", date: "May 30", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Q3 Review Meeting", description: "Celebrated +22.1% YTD. Discussed year-end strategy.", date: "May 22", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "Hedge Fund Commitment", description: "฿ 150M to Hedge Fund Series A executed. Wire confirmed.", date: "May 10", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Golf Event", description: "Client attended Yuanta Golf Day. High satisfaction noted.", date: "Apr 30", dotColor: "bg-[var(--bg-success-primary)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Referral Pipeline",
      message: "Thanawat agreed to refer 2 HNW colleagues. Est. AUM potential ฿ 300M. Follow up before Jun 15 to capture referral momentum.",
      primaryAction: "Log Referral",
      secondaryAction: "Schedule Call",
    },
    aiRiskAlert: null,
    allocationBreakdown: [
      { label: "Global Equity", value: "฿ 445M", ytd: "+22.1%", ytdPositive: true },
      { label: "Thai Equity", value: "฿ 249M", ytd: "+15.1%", ytdPositive: true },
      { label: "Alternatives", value: "฿ 89M", ytd: "+19.8%", ytdPositive: true },
      { label: "Fixed Income", value: "฿ 62M", ytd: "+3.5%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 44.5M", ytd: "+1.3%", ytdPositive: true },
    ],
  },

  "8": {
    allocationData: [
      { name: "Thai Equity", value: 45, fill: "#3b82f6" },
      { name: "Fixed Income", value: 27, fill: "#8b5cf6" },
      { name: "Cash / MMF", value: 28, fill: "#f59e0b" },
    ],
    topHoldings: [
      { asset: "SET50 ETF", value: "฿ 55M", pnl: "+฿ 5.8M", pnlPct: "+11.8%", positive: true, pct: "25.0%" },
      { asset: "DCA Equity Fund", value: "฿ 44M", pnl: "+฿ 2.9M", pnlPct: "+7.1%", positive: true, pct: "20.0%" },
      { asset: "IG Corporate Bond Fund", value: "฿ 36M", pnl: "+฿ 1.8M", pnlPct: "+5.3%", positive: true, pct: "16.4%" },
      { asset: "Short Duration Bond ETF", value: "฿ 24M", pnl: "+฿ 0.9M", pnlPct: "+3.9%", positive: true, pct: "10.9%" },
      { asset: "Cash (Idle)", value: "฿ 62M", pnl: "฿ 0", pnlPct: "0.0%", positive: true, pct: "28.2%" },
    ],
    behavioralProfile: [
      { label: "Engagement Style", value: "WhatsApp + Phone" },
      { label: "Product Preference", value: "Equity Funds + DCA" },
      { label: "Trade Frequency", value: "Monthly" },
      { label: "AI Observation", value: "Growth-oriented; open to new opportunities" },
    ],
    tasks: [
      { id: "t8-1", done: false, task: "DCA Fund proposal — pending client review", urgent: false },
      { id: "t8-2", done: false, task: "Deploy idle cash — pitch Structured Note", urgent: false },
      { id: "t8-3", done: true, task: "Q2 statement sent and confirmed received", urgent: false },
    ],
    recentActivity: [
      { label: "DCA Fund Proposal Viewed", description: "Client spent 4 min on proposal. High engagement signal.", date: "May 31", dotColor: "bg-[var(--bg-brand-primary)]" },
      { label: "Cash Deployment Alert", description: "AI flagged ฿ 62M idle cash — above 15% target.", date: "May 25", dotColor: "bg-[var(--bg-warning-primary)]" },
      { label: "Phone Call", description: "Client asked about ESG fund options for H2.", date: "May 18", dotColor: "bg-[var(--bg-success-primary)]" },
      { label: "May Statement Sent", description: "Automated statement delivered via WhatsApp + email.", date: "May 1", dotColor: "bg-[var(--bg-default-secondary-medium)]" },
    ],
    aiHighPriority: {
      title: "HIGH PRIORITY — Deploy Idle Cash",
      message: "฿ 62M idle (28% of portfolio) — significantly above 15% target. DCA Equity Fund proposal viewed but not accepted. Follow-up this week recommended.",
      primaryAction: "Follow Up",
      secondaryAction: "Revise Proposal",
    },
    aiRiskAlert: null,
    allocationBreakdown: [
      { label: "Thai Equity", value: "฿ 99M", ytd: "+9.8%", ytdPositive: true },
      { label: "Fixed Income", value: "฿ 59M", ytd: "+4.8%", ytdPositive: true },
      { label: "Cash / MMF", value: "฿ 62M", ytd: "+0.0%", ytdPositive: true, warning: "28% — above 15% target" },
    ],
  },
};

export const notificationGroups = [
  {
    label: "Today",
    items: [
      { id: "n1", title: "NBA Action — Somchai Rattanakul", description: "AI draft ready: Structured Note pitch", time: "09:15", unread: true, type: "icon" as const },
      { id: "n2", title: "Compliance Alert", description: "Sanctions match pending review", time: "08:30", unread: true, type: "icon" as const },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "n3", title: "KYC Expiry Warning", description: "Malee Pongpipat — 14 days remaining", time: "16:00", unread: false, type: "icon" as const },
      { id: "n4", title: "Deal Stage Update", description: "Thanawat Boonmee — Bond Portfolio moved to Closed Won", time: "14:30", unread: false, type: "icon" as const },
    ],
  },
];
