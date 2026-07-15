"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { StructuredProductDetail } from "../../../client/[id]/StructuredProductDetail";
import { findProductById } from "../../../client/[id]/structured-product-data";

export default function StructuredProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const product = findProductById(id);

  if (!product) return null;

  return (
    <StructuredProductDetail product={product} onBack={() => router.back()} />
  );
}
