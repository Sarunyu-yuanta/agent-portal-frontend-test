import mutualFundsRaw from "@/data/mutual-funds.json";

export type MutualFundCategoryId =
  | "global-equity"
  | "thai-equity"
  | "us-equity"
  | "japan-equity"
  | "europe-equity"
  | "emerging-equity"
  | "fixed-income"
  | "global-fixed-income"
  | "reits"
  | "commodities"
  | "gold";

export type MutualFundThemeId = "ai" | "finance" | "tech" | "energy" | "health";

export type MutualFundThemeIcon = "head-circuit" | "bank" | "cpu" | "plant" | "health";

export type MutualFund = {
  id: string;
  symbol: string;
  name: string;
  risk: number;
  price: string;
  currency: string;
  changeAbs: string;
  changePct: string;
  isPick: boolean;
};

export type MutualFundCategory = {
  id: MutualFundCategoryId;
  label: string;
};

export type MutualFundInsight = {
  id: string;
  title: string;
  date: string;
  recommendedFunds: string[];
};

export type MutualFundTheme = {
  id: MutualFundThemeId;
  title: string;
  icon: MutualFundThemeIcon;
  funds: MutualFund[];
};

export type MutualFundCatalog = {
  categories: MutualFundCategory[];
  topPerformers: Partial<Record<MutualFundCategoryId, MutualFund[]>>;
  insights: MutualFundInsight[];
  themes: MutualFundTheme[];
};

export const MUTUAL_FUND_CATALOG = mutualFundsRaw as MutualFundCatalog;

export const MUTUAL_FUND_CATEGORIES = MUTUAL_FUND_CATALOG.categories;

export function getTopPerformers(categoryId: MutualFundCategoryId): MutualFund[] {
  return (
    MUTUAL_FUND_CATALOG.topPerformers[categoryId] ??
    MUTUAL_FUND_CATALOG.topPerformers["global-equity"] ??
    []
  );
}
