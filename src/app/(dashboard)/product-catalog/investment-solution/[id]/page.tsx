"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { InvestmentSolutionDetail } from "../../../client/[id]/InvestmentSolutionDetail";
import {
  getInvestmentSolution,
  type InvestmentSolutionId,
} from "../../../client/[id]/investment-solution-data";
import type { StructuredProduct } from "../../../client/[id]/structured-product-data";

export default function InvestmentSolutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <InvestmentSolutionDetail
      solution={getInvestmentSolution(id as InvestmentSolutionId)}
      onBack={() => router.back()}
      onProductSelect={(p: StructuredProduct) =>
        router.push(`/product-catalog/product/${p.id}`)
      }
    />
  );
}
