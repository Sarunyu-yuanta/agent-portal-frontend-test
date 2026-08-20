"use client";

import { use } from "react";
import { StructuredProductDetail } from "../../../client/[id]/StructuredProductDetail";
import { findProductById } from "../../../client/[id]/structured-product-data";
import { useSectionBack } from "@/hooks/use-section-back";
import { CatalogNotFound } from "../../CatalogNotFound";

export default function StructuredProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = findProductById(decodeURIComponent(id));
  // Called unconditionally — the early return below must not skip a hook.
  const goBack = useSectionBack();

  if (!product) {
    return <CatalogNotFound message="ไม่พบสินค้านี้" onBack={goBack} />;
  }

  return <StructuredProductDetail product={product} onBack={goBack} />;
}
