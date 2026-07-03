export type StructuredProduct = {
  id: string;
  underlying: string;
  coupon: string;
  tenor: string;
  ko: string;
  strike: string;
  ki: string;
  tags: string[];
  logos: string[];
  offerDate: string;
  couponPeriod: string;
  detailTenor: string;
  productName: string;
  productType: string;
  currency: string;
  minInvestment: string;
  updatedAt: string;
};

const LOGOS = {
  ko: "https://www.figma.com/api/mcp/asset/35aeb96b-04ba-45b4-ab74-c4efce9975bc",
  wmt: "https://www.figma.com/api/mcp/asset/f2d38797-fa49-4638-80aa-b2fd40baa5b3",
  aapl: "https://www.figma.com/api/mcp/asset/3e3f247c-9e5f-4d73-889b-8e2ac39c6775",
  amzn: "https://www.figma.com/api/mcp/asset/a03ed961-2640-4be3-a716-a7f8c88bab32",
  nflx: "https://www.figma.com/api/mcp/asset/96c3fbf3-e9b9-456c-b58e-5e8de310848b",
  sawad: "https://www.figma.com/api/mcp/asset/bfc79ad4-d98a-43be-8f21-7c985bdf5f50",
  ptt: "https://www.figma.com/api/mcp/asset/66f9ced5-92fa-4ac4-92b8-0987267234ed",
};

const DEFAULT_DETAIL = {
  offerDate: "9 Feb 2029",
  couponPeriod: "ทุก 3 เดือน",
  detailTenor: "12 เดือน",
  productName: "Global FCN",
  productType: "Yield Enhancement",
  currency: "USD",
  minInvestment: "10,000 USD",
  updatedAt: "10 Sep 2026 - 09:00",
};

export const TOP_PICKS: StructuredProduct[] = [
  {
    id: "ko-wmt",
    underlying: "KO - WMT",
    coupon: "28.33%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม", "รับประกันเงินต้น"],
    logos: [LOGOS.ko, LOGOS.wmt],
    ...DEFAULT_DETAIL,
  },
  {
    id: "aapl-amzn-nflx",
    underlying: "AAPL - AMZN - NFLX",
    coupon: "30.00%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม"],
    logos: [LOGOS.aapl, LOGOS.amzn, LOGOS.nflx],
    ...DEFAULT_DETAIL,
  },
  {
    id: "sawad-ptt",
    underlying: "SAWAD - PTT",
    coupon: "29.87%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม"],
    logos: [LOGOS.sawad, LOGOS.ptt],
    ...DEFAULT_DETAIL,
  },
];

export const STRUCTURED_PRODUCTS: StructuredProduct[] = [
  {
    id: "sp-ko-wmt",
    underlying: "KO - WMT",
    coupon: "14.22%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [LOGOS.ko, LOGOS.wmt],
    ...DEFAULT_DETAIL,
  },
  {
    id: "sp-aapl-amzn-nflx",
    underlying: "AAPL - AMZN - NFLX",
    coupon: "12.56%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม"],
    logos: [LOGOS.aapl, LOGOS.amzn, LOGOS.nflx],
    ...DEFAULT_DETAIL,
  },
  {
    id: "sp-sawad-ptt",
    underlying: "SAWAD - PTT",
    coupon: "13.98%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม", "รับประกันเงินต้น"],
    logos: [LOGOS.sawad, LOGOS.ptt],
    ...DEFAULT_DETAIL,
  },
  {
    id: "sp-nasdaq-amzn-nflx",
    underlying: "Nasdaq - AMZN - NFLX",
    coupon: "11.76%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [
      "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
      LOGOS.amzn,
      LOGOS.nflx,
    ],
    ...DEFAULT_DETAIL,
  },
  {
    id: "sp-nvda-amzn-axp",
    underlying: "NVDA - AMZN - AXP",
    coupon: "10.45%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: [],
    logos: [
      "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
      LOGOS.amzn,
      "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
    ],
    ...DEFAULT_DETAIL,
  },
];

/** Products shown on Top Idea detail — Figma 34079:506875 */
export const TOP_IDEA_DETAIL_PRODUCTS: StructuredProduct[] = [
  {
    id: "ti-aapl-amzn-nflx",
    underlying: "AAPL - AMZN - NFLX",
    coupon: "30.00%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [LOGOS.aapl, LOGOS.amzn, LOGOS.nflx],
    ...DEFAULT_DETAIL,
  },
  {
    id: "ti-nasdaq-amzn-nflx",
    underlying: "Nasdaq - AMZN - NFLX",
    coupon: "25.89%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: [],
    logos: [
      "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
      LOGOS.amzn,
      LOGOS.nflx,
    ],
    ...DEFAULT_DETAIL,
  },
  {
    id: "ti-nvda-amzn-axp",
    underlying: "NVDA - AMZN - AXP",
    coupon: "24.12%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [
      "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
      LOGOS.amzn,
      "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
    ],
    ...DEFAULT_DETAIL,
  },
  {
    id: "ti-ko-wmt",
    underlying: "KO - WMT",
    coupon: "28.33%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม", "รับประกันเงินต้น"],
    logos: [LOGOS.ko, LOGOS.wmt],
    ...DEFAULT_DETAIL,
  },
  {
    id: "ti-sawad-ptt",
    underlying: "SAWAD - PTT",
    coupon: "29.87%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม"],
    logos: [LOGOS.sawad, LOGOS.ptt],
    ...DEFAULT_DETAIL,
  },
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `ti-repeat-top-${i}` })),
  ...STRUCTURED_PRODUCTS.map((p, i) => ({ ...p, id: `ti-repeat-sp-${i}` })),
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `ti-repeat-top2-${i}` })),
  ...STRUCTURED_PRODUCTS.slice(0, 4).map((p, i) => ({ ...p, id: `ti-repeat-sp2-${i}` })),
].slice(0, 20);

export const ALL_STRUCTURED_PRODUCTS_COUNT = 328;
export const ALL_STRUCTURED_PRODUCTS_UPDATED_AT = "25 August 2026 - 09:00";

/** Grid on All Structured Products page — Figma 34079:504558 */
export const ALL_STRUCTURED_PRODUCTS: StructuredProduct[] = [
  {
    id: "asp-aapl-amzn-nflx",
    underlying: "AAPL - AMZN - NFLX",
    coupon: "30.00%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [LOGOS.aapl, LOGOS.amzn, LOGOS.nflx],
    ...DEFAULT_DETAIL,
    updatedAt: "25 Aug 2026 - 09:00",
  },
  {
    id: "asp-sawad-ptt",
    underlying: "SAWAD - PTT",
    coupon: "27.45%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม", "รับประกันเงินต้น"],
    logos: [LOGOS.sawad, LOGOS.ptt],
    ...DEFAULT_DETAIL,
    updatedAt: "25 Aug 2026 - 09:00",
  },
  {
    id: "asp-nasdaq-amzn-nflx",
    underlying: "Nasdaq - AMZN - NFLX",
    coupon: "25.89%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: [],
    logos: [
      "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
      LOGOS.amzn,
      LOGOS.nflx,
    ],
    ...DEFAULT_DETAIL,
    updatedAt: "25 Aug 2026 - 09:00",
  },
  {
    id: "asp-ko-wmt",
    underlying: "KO - WMT",
    coupon: "28.33%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["ใกล้เต็ม", "รับประกันเงินต้น"],
    logos: [LOGOS.ko, LOGOS.wmt],
    ...DEFAULT_DETAIL,
    updatedAt: "25 Aug 2026 - 09:00",
  },
  {
    id: "asp-nvda-amzn-axp",
    underlying: "NVDA - AMZN - AXP",
    coupon: "24.12%",
    tenor: "6 เดือน",
    ko: "100.00%",
    strike: "80.00%",
    ki: "60.00%",
    tags: ["รับประกันเงินต้น"],
    logos: [
      "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
      LOGOS.amzn,
      "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
    ],
    ...DEFAULT_DETAIL,
    updatedAt: "25 Aug 2026 - 09:00",
  },
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `asp-repeat-${i}`, updatedAt: "25 Aug 2026 - 09:00" })),
  ...STRUCTURED_PRODUCTS.map((p, i) => ({ ...p, id: `asp-repeat-sp-${i}`, updatedAt: "25 Aug 2026 - 09:00" })),
].slice(0, 12);
