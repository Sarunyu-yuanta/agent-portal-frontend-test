"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { FixedIncomeCompanyDetail } from "../../../../client/[id]/FixedIncomeCompanyDetail";
import type { FixedIncomeBond } from "../../../../client/[id]/fixed-income-data";

export default function FixedIncomeCompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const router = useRouter();

  return (
    <FixedIncomeCompanyDetail
      companyId={companyId}
      onBack={() => router.back()}
      onBondSelect={(bond: FixedIncomeBond) =>
        router.push(`/product-catalog/fixed-income/bond/${bond.id}`)
      }
    />
  );
}
