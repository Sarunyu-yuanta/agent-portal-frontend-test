"use client";

import { useRouter } from "next/navigation";
import { TopIdeaAllPage } from "../../client/[id]/TopIdeaAllPage";

export default function TopIdeaAllPageRoute() {
  const router = useRouter();

  return (
    <TopIdeaAllPage
      onBack={() => router.back()}
      onSelect={(sector) =>
        router.push(`/product-catalog/top-idea/${encodeURIComponent(sector)}`)
      }
    />
  );
}
