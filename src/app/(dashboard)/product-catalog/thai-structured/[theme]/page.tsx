"use client";

import { use } from "react";
import { ThaiStructuredProductDetail } from "../../../client/[id]/ThaiStructuredProductDetail";
import { getThaiStructuredProduct } from "../../../client/[id]/thai-structured-data";
import { useSectionBack } from "@/hooks/use-section-back";
import { CatalogNotFound } from "../../CatalogNotFound";

export default function ThaiStructuredProductDetailPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme } = use(params);
  const product = getThaiStructuredProduct(decodeURIComponent(theme));
  // Called unconditionally — the early return below must not skip a hook.
  const goBack = useSectionBack();

  if (!product) {
    return <CatalogNotFound message="ไม่พบสินค้านี้" onBack={goBack} />;
  }

  return <ThaiStructuredProductDetail product={product} onBack={goBack} />;
}
