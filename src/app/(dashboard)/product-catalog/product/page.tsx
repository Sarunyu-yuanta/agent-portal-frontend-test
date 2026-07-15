"use client";

import { useRouter } from "next/navigation";
import { StructuredProductAllPage } from "../../client/[id]/StructuredProductAllPage";

export default function StructuredProductAllPageRoute() {
  const router = useRouter();

  return (
    <StructuredProductAllPage
      onBack={() => router.back()}
      onProductSelect={(p) => router.push(`/product-catalog/product/${p.id}`)}
    />
  );
}
