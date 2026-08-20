"use client";

import { Suspense, useState, useEffect } from "react";
import { SearchInput } from "@sarunyu/system-one";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductCatalogTab,
  type CatalogNavigation,
} from "../client/[id]/ProductCatalogTab";
import {
  catalogListHref,
  normalizeProductCategory,
} from "@/lib/product-catalog-routes";
import { useSetHeaderSlot } from "../header-slot-context";
import { useScrollThreshold } from "../client/[id]/use-scroll-threshold";
import { rememberCatalogList } from "@/lib/nav-memory";
import { setQueryState } from "@/lib/query-state";

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={null}>
      <ProductCatalogPageInner />
    </Suspense>
  );
}

function ProductCatalogPageInner() {
  const [searchValue, setSearchValue] = useState("");
  const scrolled = useScrollThreshold();
  const setHeaderSlot = useSetHeaderSlot();
  const router = useRouter();
  const searchParams = useSearchParams();

  // The category tab lives in the URL, so browser back/forward, a refresh and
  // sidebar re-entry all land on the tab the user actually had open.
  const category = normalizeProductCategory(searchParams.get("category"));
  const listUrl = catalogListHref(category);

  useEffect(() => {
    rememberCatalogList(listUrl);
  }, [listUrl]);

  useEffect(() => {
    if (scrolled) {
      setHeaderSlot(
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="ค้นหาสินทรัพย์"
          size="sm"
          className="w-full"
        />,
      );
    } else {
      setHeaderSlot(null);
    }
    return () => setHeaderSlot(null);
  }, [scrolled, searchValue, setSearchValue, setHeaderSlot]);

  const navigation: CatalogNavigation = {
    onProductSelect: (p) => router.push(`/product-catalog/product/${p.id}`),
    onAllProductsView: () => router.push("/product-catalog/product"),
    onTopIdeaSelect: (sector) =>
      router.push(`/product-catalog/top-idea/${encodeURIComponent(sector)}`),
    onAllTopIdeasView: () => router.push("/product-catalog/top-idea"),
    onInvestmentSolutionSelect: (id) =>
      router.push(`/product-catalog/investment-solution/${id}`),
    onFixedIncomeBondSelect: (bond) =>
      router.push(`/product-catalog/fixed-income/bond/${bond.id}`),
    onGlobalBondIssuerSelect: (id) =>
      router.push(`/product-catalog/global-bond/${id}`),
    onAllGlobalBondsView: () => router.push("/product-catalog/global-bond"),
    onThaiProductSelect: (p) =>
      router.push(
        `/product-catalog/thai-structured/${encodeURIComponent(p.theme)}`,
      ),
  };

  return (
    <ProductCatalogTab
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      activeCategory={category}
      onCategoryChange={(id) =>
        setQueryState(catalogListHref(id), "push")
      }
      navigation={navigation}
    />
  );
}
