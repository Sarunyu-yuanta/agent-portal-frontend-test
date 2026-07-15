"use client";

import { useRouter } from "next/navigation";
import { GlobalBondAllPage } from "../../client/[id]/GlobalBondAllPage";

export default function GlobalBondAllPageRoute() {
  const router = useRouter();

  return <GlobalBondAllPage onBack={() => router.back()} />;
}
