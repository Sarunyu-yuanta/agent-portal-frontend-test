"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { TopIdeaDetail } from "../../../client/[id]/TopIdeaDetail";
import type { TopIdeaSector } from "../../../client/[id]/top-idea-data";
import type { StructuredProduct } from "../../../client/[id]/structured-product-data";

export default function TopIdeaDetailPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = use(params);
  const router = useRouter();

  return (
    <TopIdeaDetail
      sector={decodeURIComponent(sector) as TopIdeaSector}
      onBack={() => router.back()}
      onProductSelect={(p: StructuredProduct) =>
        router.push(`/product-catalog/product/${p.id}`)
      }
    />
  );
}
