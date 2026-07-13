"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@sarunyu/system-one";
import { ProductCatalogTab } from "../client/[id]/ProductCatalogTab";
import { useSetHeaderSlot } from "../header-slot-context";
import { useScrollThreshold } from "../client/[id]/use-scroll-threshold";

export default function ProductCatalogPage() {
  const [searchValue, setSearchValue] = useState("");
  const scrolled = useScrollThreshold();
  const setHeaderSlot = useSetHeaderSlot();

  useEffect(() => {
    if (scrolled) {
      setHeaderSlot(
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="ค้นหาสินทรัพย์"
          size="sm"
          className="w-full"
        />
      );
    } else {
      setHeaderSlot(null);
    }
    return () => setHeaderSlot(null);
  }, [scrolled, searchValue, setSearchValue, setHeaderSlot]);

  return <ProductCatalogTab searchValue={searchValue} onSearchChange={setSearchValue} />;
}
