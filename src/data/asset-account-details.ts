export type AssetAccountItem = {
  name: string;
  accountNo: string;
  value: string;
  changeAmount?: string;
  changePercent?: string;
  changePositive?: boolean;
  avgYield?: string;
  statusIcon: string;
};

export const DEFAULT_ASSET_ACCOUNTS: AssetAccountItem[] = [
  {
    name: "Cash Balance a/c",
    accountNo: "12***6-3",
    value: "350,000.00",
    changeAmount: "+12,450.00",
    changePercent: "0.05",
    changePositive: true,
    statusIcon: "/asset-allocation/status-0.svg",
  },
  {
    name: "Global a/c",
    accountNo: "12***6-2",
    value: "200,000.00",
    changeAmount: "-2,100.00",
    changePercent: "0.05",
    changePositive: false,
    statusIcon: "/asset-allocation/status-2.svg",
  },
  {
    name: "Cash a/c",
    accountNo: "12***6-1",
    value: "180,000.00",
    changeAmount: "+890.00",
    changePercent: "0.05",
    changePositive: true,
    statusIcon: "/asset-allocation/status-0.svg",
  },
  {
    name: "Margin Trading a/c",
    accountNo: "12***6-4",
    value: "90,000.00",
    changeAmount: "+2,340.00",
    changePercent: "0.05",
    changePositive: true,
    statusIcon: "/asset-allocation/status-1.svg",
  },
  {
    name: "Derivative a/c",
    accountNo: "12***6-5",
    value: "50,000.00",
    changeAmount: "-500.00",
    changePercent: "0.05",
    changePositive: false,
    statusIcon: "/asset-allocation/status-6.svg",
  },
  {
    name: "Fixed Income a/c",
    accountNo: "12***6-6",
    value: "280,000.00",
    avgYield: "7.32",
    statusIcon: "/asset-allocation/status-5.svg",
  },
  {
    name: "Derivatives Trading a/c",
    accountNo: "12***6-7",
    value: "30,000.00",
    changeAmount: "+120.00",
    changePercent: "0.05",
    changePositive: true,
    statusIcon: "/asset-allocation/status-6.svg",
  },
];

export type PositionField = {
  label: string;
  value: string;
};

export type PositionSummary = {
  fields: PositionField[];
};

export type HoldingItem = {
  id: string;
  symbol: string;
  fullName: string;
  value: string;
  changeAmount: string;
  changePercent: string;
  changePositive: boolean;
  collateral?: boolean;
  position?: PositionSummary;
};

export type HoldingSection = {
  title: string;
  items: HoldingItem[];
};

export type AssetAccountDetail = {
  viewByLabel: string;
  sections: HoldingSection[];
};

const THAI_STOCK_SECTION: HoldingSection = {
  title: "หุ้นไทย",
  items: [
    {
      id: "ae-1",
      symbol: "AE",
      fullName: "All Energy & Utilities public company limited",
      value: "10,000.00",
      changeAmount: "+56,498.10",
      changePercent: "0.05",
      changePositive: true,
      collateral: true,
    },
    {
      id: "ae-2",
      symbol: "AE",
      fullName: "All Energy & Utilities public company limited",
      value: "10,000.00",
      changeAmount: "-2,000.00",
      changePercent: "0.05",
      changePositive: false,
    },
    {
      id: "ae-3",
      symbol: "AE",
      fullName: "All Energy & Utilities public company limited",
      value: "10,000.00",
      changeAmount: "+56,498.10",
      changePercent: "0.05",
      changePositive: true,
      position: {
        fields: [
          { label: "Average Cost (THB)", value: "0.12" },
          { label: "Current Price (THB)", value: "0.10" },
          { label: "Cost Amount (THB)", value: "12,000.00" },
          { label: "Market Value (THB)", value: "10,000.00" },
          { label: "Quantity", value: "100,000" },
        ],
      },
    },
    {
      id: "ae-4",
      symbol: "AE",
      fullName: "All Energy & Utilities public company limited",
      value: "10,000.00",
      changeAmount: "-2,000.00",
      changePercent: "0.05",
      changePositive: false,
    },
  ],
};

const MUTUAL_FUND_SECTION: HoldingSection = {
  title: "กองทุนรวม",
  items: [
    {
      id: "kflt-1",
      symbol: "KFLTFDIV",
      fullName: "Asset Plus Digital Blockchain Super Saving Fund",
      value: "200,000.00",
      changeAmount: "-498.10",
      changePercent: "0.05",
      changePositive: false,
    },
    {
      id: "kflt-2",
      symbol: "KFLTFDIV",
      fullName: "Asset Plus Digital Blockchain Super Saving Fund",
      value: "200,000.00",
      changeAmount: "+8,000.00",
      changePercent: "0.05",
      changePositive: true,
    },
  ],
};

export const ASSET_ACCOUNT_DETAILS: Record<string, AssetAccountDetail> = {
  "12***6-3": {
    viewByLabel: "view by Asset Class - Cash",
    sections: [
      {
        title: "เงินสด",
        items: [
          {
            id: "cash-1",
            symbol: "THB",
            fullName: "Cash Balance",
            value: "250,000.00",
            changeAmount: "+0.00",
            changePercent: "0.00",
            changePositive: true,
          },
          {
            id: "cash-2",
            symbol: "THB",
            fullName: "Pending Settlement",
            value: "100,000.00",
            changeAmount: "+0.00",
            changePercent: "0.00",
            changePositive: true,
          },
        ],
      },
    ],
  },
  "12***6-2": {
    viewByLabel: "view by Asset Class - Global Equity",
    sections: [
      {
        title: "หุ้นต่างประเทศ",
        items: [
          {
            id: "aapl",
            symbol: "AAPL",
            fullName: "Apple Inc.",
            value: "120,000.00",
            changeAmount: "+4,200.00",
            changePercent: "0.12",
            changePositive: true,
            position: {
              fields: [
                { label: "Average Cost (THB)", value: "175.20" },
                { label: "Current Price (THB)", value: "182.50" },
                { label: "Cost Amount (THB)", value: "105,120.00" },
                { label: "Market Value (THB)", value: "120,000.00" },
                { label: "Quantity", value: "657" },
              ],
            },
          },
          {
            id: "msft",
            symbol: "MSFT",
            fullName: "Microsoft Corporation",
            value: "80,000.00",
            changeAmount: "-6,300.00",
            changePercent: "0.08",
            changePositive: false,
          },
        ],
      },
    ],
  },
  "12***6-1": {
    viewByLabel: "view by Asset Class - Cash",
    sections: [
      {
        title: "เงินสด",
        items: [
          {
            id: "cash-ac-1",
            symbol: "THB",
            fullName: "Available Cash",
            value: "180,000.00",
            changeAmount: "+890.00",
            changePercent: "0.05",
            changePositive: true,
          },
        ],
      },
    ],
  },
  "12***6-4": {
    viewByLabel: "view by Asset Class - Equity",
    sections: [THAI_STOCK_SECTION, MUTUAL_FUND_SECTION],
  },
  "12***6-5": {
    viewByLabel: "view by Asset Class - Derivatives",
    sections: [
      {
        title: "อนุพันธ์",
        items: [
          {
            id: "der-1",
            symbol: "S50H26",
            fullName: "SET50 Index Futures Mar 26",
            value: "30,000.00",
            changeAmount: "-320.00",
            changePercent: "0.04",
            changePositive: false,
          },
          {
            id: "der-2",
            symbol: "USDTHB",
            fullName: "USD/THB Futures",
            value: "20,000.00",
            changeAmount: "-180.00",
            changePercent: "0.03",
            changePositive: false,
          },
        ],
      },
    ],
  },
  "12***6-6": {
    viewByLabel: "view by Asset Class - Fixed Income",
    sections: [
      {
        title: "ตราสารหนี้",
        items: [
          {
            id: "bond-1",
            symbol: "TG2030",
            fullName: "Thai Government Bond 2030",
            value: "150,000.00",
            changeAmount: "+1,200.00",
            changePercent: "0.02",
            changePositive: true,
            position: {
              fields: [
                { label: "Average Cost (THB)", value: "98.50" },
                { label: "Current Price (THB)", value: "99.20" },
                { label: "Cost Amount (THB)", value: "147,750.00" },
                { label: "Market Value (THB)", value: "150,000.00" },
                { label: "Quantity", value: "1,500" },
              ],
            },
          },
          {
            id: "bond-2",
            symbol: "IGCB",
            fullName: "IG Corporate Bond Fund",
            value: "130,000.00",
            changeAmount: "+980.00",
            changePercent: "0.03",
            changePositive: true,
          },
        ],
      },
    ],
  },
  "12***6-7": {
    viewByLabel: "view by Asset Class - Derivatives",
    sections: [
      {
        title: "อนุพันธ์",
        items: [
          {
            id: "der-t-1",
            symbol: "S50M26",
            fullName: "SET50 Index Futures Jun 26",
            value: "30,000.00",
            changeAmount: "+120.00",
            changePercent: "0.05",
            changePositive: true,
          },
        ],
      },
    ],
  },
};

const ASSET_PRODUCT_DETAILS: Record<string, AssetAccountDetail> = {
  เงินสด: {
    viewByLabel: "view by Asset Class - Cash",
    sections: [
      {
        title: "เงินสด",
        items: [
          {
            id: "cash-p-1",
            symbol: "THB",
            fullName: "Cash Balance",
            value: "250,000.00",
            changeAmount: "+0.00",
            changePercent: "0.00",
            changePositive: true,
          },
        ],
      },
    ],
  },
  หุ้นไทย: {
    viewByLabel: "view by Asset Class - Equity",
    sections: [THAI_STOCK_SECTION],
  },
  หุ้นต่างประเทศ: {
    viewByLabel: "view by Asset Class - Global Equity",
    sections: [
      {
        title: "หุ้นต่างประเทศ",
        items: [
          {
            id: "global-p-1",
            symbol: "AAPL",
            fullName: "Apple Inc.",
            value: "120,000.00",
            changeAmount: "+3,200.00",
            changePercent: "0.05",
            changePositive: true,
          },
          {
            id: "global-p-2",
            symbol: "MSFT",
            fullName: "Microsoft Corporation",
            value: "80,000.00",
            changeAmount: "-1,500.00",
            changePercent: "0.05",
            changePositive: false,
          },
        ],
      },
    ],
  },
  กองทุนรวม: {
    viewByLabel: "view by Asset Class - Mutual Fund",
    sections: [MUTUAL_FUND_SECTION],
  },
  ตราสารหนี้: {
    viewByLabel: "view by Asset Class - Fixed Income",
    sections: [
      {
        title: "ตราสารหนี้",
        items: [
          {
            id: "bond-p-1",
            symbol: "SCB246A",
            fullName: "SCB Bank Public Company Limited",
            value: "180,000.00",
            changeAmount: "+890.00",
            changePercent: "0.05",
            changePositive: true,
          },
        ],
      },
    ],
  },
  อนุพันธ์: {
    viewByLabel: "view by Asset Class - Derivatives",
    sections: [
      {
        title: "อนุพันธ์",
        items: [
          {
            id: "der-p-1",
            symbol: "S50M26",
            fullName: "SET50 Index Futures Jun 26",
            value: "30,000.00",
            changeAmount: "+120.00",
            changePercent: "0.05",
            changePositive: true,
          },
        ],
      },
    ],
  },
};

export function getAssetAccountDetail(accountNo: string): AssetAccountDetail {
  const detail =
    ASSET_ACCOUNT_DETAILS[accountNo] ?? {
      viewByLabel: "view by Asset Class - Equity",
      sections: [THAI_STOCK_SECTION, MUTUAL_FUND_SECTION],
    };

  return enrichDetailWithPositions(detail);
}

export function getAssetProductDetail(productName: string): AssetAccountDetail {
  const detail =
    ASSET_PRODUCT_DETAILS[productName] ?? {
      viewByLabel: `view by Asset Class - ${productName}`,
      sections: [THAI_STOCK_SECTION],
    };

  return enrichDetailWithPositions(detail);
}

function defaultPosition(value: string): PositionSummary {
  return {
    fields: [
      { label: "Average Cost (THB)", value: "0.12" },
      { label: "Current Price (THB)", value: "0.10" },
      { label: "Cost Amount (THB)", value: "12,000.00" },
      { label: "Market Value (THB)", value },
      { label: "Quantity", value: "100,000" },
    ],
  };
}

function enrichDetailWithPositions(detail: AssetAccountDetail): AssetAccountDetail {
  return {
    ...detail,
    sections: detail.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        position: item.position ?? defaultPosition(item.value),
      })),
    })),
  };
}
