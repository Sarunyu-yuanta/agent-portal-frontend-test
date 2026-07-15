"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@sarunyu/system-one";
import { useRouter } from "next/navigation";
import { ProductCatalogTab, type CatalogNavigation } from "../client/[id]/ProductCatalogTab";
import { useSetHeaderSlot } from "../header-slot-context";
import { useScrollThreshold } from "../client/[id]/use-scroll-threshold";

export default function ProductCatalogPage() {
  const [searchValue, setSearchValue] = useState("");
  const scrolled = useScrollThreshold();
  const setHeaderSlot = useSetHeaderSlot();
  const router = useRouter();

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
  };

  return (
    <ProductCatalogTab
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      navigation={navigation}
    />
  );
}
