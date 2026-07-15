"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { FixedIncomeDetail } from "../../../../client/[id]/FixedIncomeDetail";
import { getFixedIncomeBond } from "../../../../client/[id]/fixed-income-data";

export default function FixedIncomeBondDetailPage({
  params,
}: {
  params: Promise<{ bondId: string }>;
}) {
  const { bondId } = use(params);
  const router = useRouter();
  const bond = getFixedIncomeBond(bondId);

  if (!bond) return null;

  return (
    <FixedIncomeDetail
      bond={bond}
      onBack={() => router.back()}
      onCompanySelect={(companyId: string) =>
        router.push(`/product-catalog/fixed-income/company/${companyId}`)
      }
    />
  );
}
