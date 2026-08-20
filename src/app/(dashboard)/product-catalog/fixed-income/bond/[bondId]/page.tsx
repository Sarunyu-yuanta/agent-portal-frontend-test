"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { FixedIncomeDetail } from "../../../../client/[id]/FixedIncomeDetail";
import { getFixedIncomeBond } from "../../../../client/[id]/fixed-income-data";
import { useSectionBack } from "@/hooks/use-section-back";
import { CatalogNotFound } from "../../../CatalogNotFound";

export default function FixedIncomeBondDetailPage({
  params,
}: {
  params: Promise<{ bondId: string }>;
}) {
  const { bondId } = use(params);
  const router = useRouter();
  const bond = getFixedIncomeBond(decodeURIComponent(bondId));
  // Called unconditionally — the early return below must not skip a hook.
  const goBack = useSectionBack();

  if (!bond) {
    return <CatalogNotFound message="ไม่พบตราสารหนี้นี้" onBack={goBack} />;
  }

  return (
    <FixedIncomeDetail
      bond={bond}
      onBack={goBack}
      onCompanySelect={(companyId: string) =>
        router.push(`/product-catalog/fixed-income/company/${companyId}`)
      }
    />
  );
}
