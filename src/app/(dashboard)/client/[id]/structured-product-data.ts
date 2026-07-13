import structuredProductsRaw from "@/data/structured-products.json";

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
  requestNotionalSize?: string;
  confirmedRequest?: string;
  issuer?: string;
  underlyingNames?: string[];
  underlyingSectors?: string[];
};

export const TOP_PICKS = structuredProductsRaw.topPicks as StructuredProduct[];
export const STRUCTURED_PRODUCTS = structuredProductsRaw.products as StructuredProduct[];

export const ALL_STRUCTURED_PRODUCTS_COUNT = structuredProductsRaw.meta.allCount;
export const ALL_STRUCTURED_PRODUCTS_UPDATED_AT = structuredProductsRaw.meta.updatedAt;
export const ALL_STRUCTURED_PRODUCTS_UPDATED_AT_TABLET = structuredProductsRaw.meta.updatedAtTablet;

export const ALL_STRUCTURED_PRODUCTS: StructuredProduct[] = [
  ...(structuredProductsRaw.allProductsBase as StructuredProduct[]),
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `asp-repeat-${i}`, updatedAt: "25 Aug 2026 - 09:00" })),
  ...STRUCTURED_PRODUCTS.map((p, i) => ({ ...p, id: `asp-repeat-sp-${i}`, updatedAt: "25 Aug 2026 - 09:00" })),
].slice(0, 12);

export const TOP_IDEA_DETAIL_PRODUCTS: StructuredProduct[] = [
  ...(structuredProductsRaw.topIdeaDetailBase as StructuredProduct[]),
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `ti-repeat-top-${i}` })),
  ...STRUCTURED_PRODUCTS.map((p, i) => ({ ...p, id: `ti-repeat-sp-${i}` })),
  ...TOP_PICKS.map((p, i) => ({ ...p, id: `ti-repeat-top2-${i}` })),
  ...STRUCTURED_PRODUCTS.slice(0, 4).map((p, i) => ({ ...p, id: `ti-repeat-sp2-${i}` })),
].slice(0, 20);
