export type FixedIncomeStatus = "open" | "upcoming" | "soon";
export type FixedIncomeAction = "invest" | "follow" | "followed";

export type FixedIncomeDocument = {
  label: string;
  href?: string;
};

export type FixedIncomeBond = {
  id: string;
  symbol: string;
  fullCompanyName: string;
  companyName: string;
  logoIdx: number;
  logoCrop?: boolean;
  status: FixedIncomeStatus;
  statusLabel: string;
  bondCategory: string;
  ytm: string;
  couponRate: string;
  couponPeriod: string;
  tenor: string;
  maturity: string;
  companyRating: string;
  bondRating: string;
  risk: string;
  guarantee: string;
  offerType: string;
  subscriptionPeriod: string;
  documents: FixedIncomeDocument[];
  updatedAt: string;
  action: FixedIncomeAction;
};

const COMPANY_NAMES: Record<string, string> = {
  MQDC: "บริษัท แมกโนเลีย ควอลิตี้ ดีเวล็อปเม้นต์ คอร์ปอเรชั่น จำกัด",
  JMT: "บริษัท เจ เอ็มที เน็ตเวอร์ค เซอร์วิสเซส (ประเทศไทย) จำกัด (มหาชน)",
  TMN: "บริษัท ทรู มูฟ เอช ยูนิเวอร์แซล คอมมิวนิเคชั่น จำกัด (มหาชน)",
  NOBLE: "บริษัท โนเบิล ดีเวลลอปเม้นท์ จำกัด (มหาชน)",
  DTP: "บริษัท ดีทีซี เอ็นเตอร์ไ_prises จำกัด (มหาชน)",
  TTA: "บริษัท ทีทีเอ จำกัด (มหาชน)",
  TRUE: "บริษัท ทรู คอร์poration จำกัด (มหาชน)",
  PTTGC: "บริษัท พีทีที โกลบอล เคมิคัล จำกัด (มหาชน)",
};

const DEFAULT_DOCUMENTS: FixedIncomeDocument[] = [
  { label: "Fund Fact Sheet" },
  { label: "Presentation" },
];

function bond(
  id: string,
  row: Omit<FixedIncomeBond, "id" | "fullCompanyName" | "documents" | "updatedAt"> & {
    fullCompanyName?: string;
    documents?: FixedIncomeDocument[];
    updatedAt?: string;
  },
): FixedIncomeBond {
  return {
    ...row,
    id,
    fullCompanyName: row.fullCompanyName ?? COMPANY_NAMES[row.companyName] ?? row.companyName,
    documents: row.documents ?? DEFAULT_DOCUMENTS,
    updatedAt: row.updatedAt ?? "10 ก.ย. 2568 - 09:00",
  };
}

export const FIXED_INCOME_BONDS: FixedIncomeBond[] = [
  bond("mqdc482b-0", {
    symbol: "MQDC482B",
    companyName: "MQDC",
    logoIdx: 0,
    status: "open",
    statusLabel: "เปิดจอง",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "6.75%",
    couponRate: "5.14 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "1 ปี 6 เดือน 24 วัน",
    maturity: "10 Feb 2029",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "16 - 18 มี.ค. 2026",
    action: "invest",
  }),
  bond("jmt127a-0", {
    symbol: "JMT127A",
    companyName: "JMT",
    logoIdx: 1,
    status: "open",
    statusLabel: "เปิดจอง",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "4.25%",
    couponRate: "4.00 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "2 ปี 3 เดือน 10 วัน",
    maturity: "25 เม.ย. 2574",
    companyRating: "AA-",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "ไม่มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "16 - 18 ก.ค. 2026",
    action: "invest",
  }),
  bond("tmn934b-0", {
    symbol: "TMN934B",
    companyName: "TMN",
    logoIdx: 2,
    status: "upcoming",
    statusLabel: "อีก 4 วัน",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "4.50%",
    couponRate: "4.25 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "1 ปี 7 เดือน 15 วัน",
    maturity: "15 มี.ค. 2573",
    companyRating: "CCC+",
    bondRating: "BB+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO",
    subscriptionPeriod: "13 - 15 มิ.ย. 2026",
    action: "follow",
  }),
  bond("mqdc482a-0", {
    symbol: "MQDC482A",
    companyName: "MQDC",
    logoIdx: 0,
    status: "upcoming",
    statusLabel: "อีก 15 วัน",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "6.10%",
    couponRate: "5.80 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "3 ปี 5 เดือน 8 วัน",
    maturity: "30 มิ.ย. 2575",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "19 - 21 ส.ค. 2026",
    action: "follow",
  }),
  bond("mqdc482b-1", {
    symbol: "MQDC482B",
    companyName: "MQDC",
    logoIdx: 0,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "6.75%",
    couponRate: "5.14 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "1 ปี 6 เดือน 24 วัน",
    maturity: "10 Feb 2029",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "HNW/UHNW",
    subscriptionPeriod: "10 - 12 พ.ค. 2026",
    action: "followed",
  }),
  bond("jmt127a-1", {
    symbol: "JMT127A",
    companyName: "JMT",
    logoIdx: 1,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "4.25%",
    couponRate: "4.00 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "2 ปี 3 เดือน 10 วัน",
    maturity: "25 เม.ย. 2574",
    companyRating: "AA-",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "ไม่มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "16 - 18 ก.ค. 2026",
    action: "follow",
  }),
  bond("tmn934b-1", {
    symbol: "TMN934B",
    companyName: "TMN",
    logoIdx: 2,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "4.50%",
    couponRate: "4.25 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "1 ปี 7 เดือน 15 วัน",
    maturity: "15 มี.ค. 2573",
    companyRating: "CCC+",
    bondRating: "BB+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO",
    subscriptionPeriod: "13 - 15 มิ.ย. 2026",
    action: "follow",
  }),
  bond("mqdc482a-1", {
    symbol: "MQDC482A",
    companyName: "MQDC",
    logoIdx: 0,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "6.10%",
    couponRate: "5.80 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "3 ปี 5 เดือน 8 วัน",
    maturity: "30 มิ.ย. 2575",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "19 - 21 ส.ค. 2026",
    action: "followed",
  }),
  bond("noble278a-0", {
    symbol: "NOBLE278A",
    companyName: "NOBLE",
    logoIdx: 3,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "4.25%",
    couponRate: "4.10 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "4 ปี 2 เดือน 20 วัน",
    maturity: "12 Aug 2576",
    companyRating: "BBB",
    bondRating: "AA",
    risk: "ระดับ 5",
    guarantee: "ไม่มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "22 - 24 ก.ย. 2026",
    action: "follow",
  }),
  bond("dtp286b-0", {
    symbol: "DTP286B",
    companyName: "DTP",
    logoIdx: 4,
    logoCrop: true,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "2.90%",
    couponRate: "2.75 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "5 ปี 1 เดือน 5 วัน",
    maturity: "1 Sep 2577",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "HNW/UHNW",
    subscriptionPeriod: "25 - 27 ต.ค. 2026",
    action: "follow",
  }),
  bond("tta287a-0", {
    symbol: "TTA287A",
    companyName: "TTA",
    logoIdx: 5,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "5.10%",
    couponRate: "4.95 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "6 ปี 4 เดือน 12 วัน",
    maturity: "20 ต.ค. 2578",
    companyRating: "BB",
    bondRating: "BBB+",
    risk: "ระดับ 5",
    guarantee: "ไม่มีประกัน",
    offerType: "PO",
    subscriptionPeriod: "28 - 30 พ.ย. 2026",
    action: "follow",
  }),
  bond("true341a-0", {
    symbol: "TRUE341A",
    companyName: "TRUE",
    logoIdx: 6,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "3.00%",
    couponRate: "2.85 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "7 ปี 3 เดือน 25 วัน",
    maturity: "8 พ.ย. 2579",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "1 - 3 ธ.ค. 2026",
    action: "follow",
  }),
  bond("pttgc24pa-0", {
    symbol: "PTTGC24PA",
    companyName: "PTTGC",
    logoIdx: 7,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "6.50%",
    couponRate: "6.25 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "9 ปี 2 เดือน 18 วัน",
    maturity: "15 Dec 2580",
    companyRating: "BBB+",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO",
    subscriptionPeriod: "4 - 6 ม.ค. 2027",
    action: "follow",
  }),
  bond("pttgc24pb-0", {
    symbol: "PTTGC24PB",
    companyName: "PTTGC",
    logoIdx: 7,
    status: "soon",
    statusLabel: "เร็ว ๆ นี้",
    bondCategory: "หุ้นกู้ตลาดแรก",
    ytm: "7.25%",
    couponRate: "7.00 %",
    couponPeriod: "ทุก 3 เดือน",
    tenor: "10 ปี 1 เดือน 1 วัน",
    maturity: "5 Jan2581",
    companyRating: "AAA",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO",
    subscriptionPeriod: "7 - 9 ก.พ. 2027",
    action: "follow",
  }),
];

const COMPANY_ONLY_BONDS: FixedIncomeBond[] = [
  bond("mqdc482b-sec-0", {
    symbol: "MQDC481A",
    companyName: "MQDC",
    logoIdx: 0,
    status: "open",
    statusLabel: "เปิดจอง",
    bondCategory: "หุ้นกู้ตลาดรอง",
    ytm: "7.50%",
    couponRate: "6.25 %",
    couponPeriod: "ทุก 6 เดือน",
    tenor: "2 ปี 4 เดือน",
    maturity: "15 Mar 2028",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "HNW/UHNW",
    subscriptionPeriod: "ตลอดเวลา",
    action: "invest",
  }),
  bond("mqdc482a-sec-0", {
    symbol: "MQDC480B",
    companyName: "MQDC",
    logoIdx: 0,
    status: "open",
    statusLabel: "เปิดจอง",
    bondCategory: "หุ้นกู้ตลาดรอง",
    ytm: "8.25%",
    couponRate: "7.00 %",
    couponPeriod: "ทุก 6 เดือน",
    tenor: "3 ปี 2 เดือน",
    maturity: "20 Jun 2029",
    companyRating: "BBB+/Stable",
    bondRating: "AA+",
    risk: "ระดับ 5",
    guarantee: "มีประกัน",
    offerType: "PO/HNW",
    subscriptionPeriod: "ตลอดเวลา",
    action: "invest",
  }),
];

export type FixedIncomeCompany = {
  id: string;
  fullName: string;
  logoIdx: number;
  description: string;
  ticker: string;
  offeringType: string;
  minSubscription: string;
  updatedAt: string;
};

const FIXED_INCOME_COMPANIES: FixedIncomeCompany[] = [
  {
    id: "MQDC",
    fullName: COMPANY_NAMES.MQDC,
    logoIdx: 0,
    description:
      "หุ้นกู้เสี่ยงสูงมีประกัน โดยมีผู้ค้ำประกันของบริษัท แมกโนเลีย ควอลิตี้ ดีเวล็อปเม้นต์ คอร์ปอเรชั่น จำกัด ครั้งที่ 5/2026",
    ticker: "MQDC",
    offeringType: "PO, II/HNW",
    minSubscription: "100,000 บาท | ทวีคูณครั้งละ 100,000 บาท",
    updatedAt: "10 กันยายน 2026 - 09:00",
  },
  {
    id: "JMT",
    fullName: COMPANY_NAMES.JMT,
    logoIdx: 1,
    description: "หุ้นกู้ของบริษัท เจ เอ็มที เน็ตเวอร์ค เซอร์วิสเซส (ประเทศไทย) จำกัด (มหาชน)",
    ticker: "JMT",
    offeringType: "PO/HNW",
    minSubscription: "100,000 บาท | ทวีคูณครั้งละ 100,000 บาท",
    updatedAt: "10 กันยายน 2026 - 09:00",
  },
  {
    id: "TMN",
    fullName: COMPANY_NAMES.TMN,
    logoIdx: 2,
    description: "หุ้นกู้ของบริษัท ทรู มูฟ เอช ยูนิเวอร์แซล คอมมิวนิเคชั่น จำกัด (มหาชน)",
    ticker: "TMN",
    offeringType: "PO",
    minSubscription: "100,000 บาท | ทวีคูณครั้งละ 100,000 บาท",
    updatedAt: "10 กันยายน 2026 - 09:00",
  },
];

function allBonds(): FixedIncomeBond[] {
  return [...FIXED_INCOME_BONDS, ...COMPANY_ONLY_BONDS];
}

export function getFixedIncomeCompany(companyId: string): FixedIncomeCompany | undefined {
  return FIXED_INCOME_COMPANIES.find((c) => c.id === companyId);
}

export function resolveFixedIncomeCompany(companyId: string): FixedIncomeCompany | null {
  const existing = getFixedIncomeCompany(companyId);
  if (existing) return existing;

  const bonds = FIXED_INCOME_BONDS.filter((b) => b.companyName === companyId);
  if (bonds.length === 0) return null;

  const first = bonds[0];
  return {
    id: companyId,
    fullName: first.fullCompanyName,
    logoIdx: first.logoIdx,
    description: "",
    ticker: companyId,
    offeringType: first.offerType,
    minSubscription: "100,000 บาท | ทวีคูณครั้งละ 100,000 บาท",
    updatedAt: first.updatedAt,
  };
}

export function getCompanyPrimaryBonds(companyId: string): FixedIncomeBond[] {
  return allBonds().filter(
    (b) => b.companyName === companyId && b.bondCategory === "หุ้นกู้ตลาดแรก",
  );
}

export function getCompanySecondaryBonds(companyId: string): FixedIncomeBond[] {
  return allBonds().filter(
    (b) => b.companyName === companyId && b.bondCategory === "หุ้นกู้ตลาดรอง",
  );
}

export function getFixedIncomeBond(id: string): FixedIncomeBond | undefined {
  return allBonds().find((b) => b.id === id);
}

export function getBookingLabel(bond: FixedIncomeBond): string {
  const prefix = bond.status === "open" ? "เปิดจอง" : "คาดว่าเปิดจอง";
  return `${prefix} ${bond.subscriptionPeriod}`;
}

export function getRiskNumber(risk: string): string {
  return risk.replace("ระดับ ", "");
}

export const BOND_LOGOS = [
  "https://www.figma.com/api/mcp/asset/a5f05391-6db4-4331-8aef-ef94906f3c62",
  "https://www.figma.com/api/mcp/asset/421a208c-5a27-4d6e-8da6-7fc9f6274002",
  "https://www.figma.com/api/mcp/asset/b5eb430c-1593-4e1f-97bf-c372874a0de9",
  "https://www.figma.com/api/mcp/asset/394969de-3f1d-491f-a01e-d762b900434e",
  "https://www.figma.com/api/mcp/asset/81b9a35e-2fbd-42d3-bd07-29549a0ebab2",
  "https://www.figma.com/api/mcp/asset/fc024e02-b5f6-4f55-aadd-8660f197d433",
  "https://www.figma.com/api/mcp/asset/b034589d-7f5d-4869-a6f9-075b424c900d",
  "https://www.figma.com/api/mcp/asset/75efc54f-3be6-4cef-a9b4-b98d357f57b8",
];
