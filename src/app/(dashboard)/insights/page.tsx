"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TabGroup } from "@sarunyu/system-one";
import { setQueryState, withQuery } from "@/lib/query-state";
import { navRead, navWrite } from "@/lib/nav-session";
import {
  StrategyPlaybooks,
  normalizeAssetFilter,
  type AssetClassFilter,
} from "./StrategyPlaybooks";
import { AIRecommendCard } from "./AIRecommendCard";
import { Research4U } from "./Research4U";

function RightSidebar() {
  return (
    <div className="flex flex-col gap-5 sticky top-6 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
      <AIRecommendCard />
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={null}>
      <InsightsPageInner />
    </Suspense>
  );
}

/**
 * The filter chip is session memory, not a URL param.
 *
 * Reading an article and coming back keeps it (the component remounts and reads
 * this), but a reload drops it — `nav-session` clears every `nav:` key on a
 * fresh document load, which is the rule the user asked for: only Client 360's
 * column filter is remembered for good. The trade-off they accepted is that a
 * shared link can't carry a filter.
 */
const FILTER_KEY = "nav:insights-filter";

function InsightsPageInner() {
  const searchParams = useSearchParams();

  // The tab stays in the URL — it's a destination, not a refinement.
  const activeTab =
    searchParams.get("tab") === "research4u" ? "research4u" : "insights";

  // Seeded from storage rather than held there: on a fresh load it has just
  // been cleared, so the server and the client both start at "All" and
  // hydration matches.
  const [filter, setFilterState] = useState<AssetClassFilter>(() =>
    normalizeAssetFilter(navRead(FILTER_KEY)),
  );
  const setFilter = useCallback((next: AssetClassFilter) => {
    setFilterState(next);
    navWrite(FILTER_KEY, next);
  }, []);

  // `replace`, not `push` — refining a list shouldn't fill up history with
  // entries the user has to click through to leave the page.
  const updateQuery = useCallback(
    (updates: Record<string, string | null>) =>
      setQueryState(withQuery("/insights", searchParams, updates), "replace"),
    [searchParams],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="transparent-tabs scrollable-tabs -mx-4 xl:-mx-6 pl-4 xl:pl-6">
        <TabGroup
          items={[
            { id: "insights",   title: "House View" },
            { id: "research4u", title: "Research 4U" },
          ]}
          activeId={activeTab}
          onChange={(id) =>
            updateQuery({ tab: id === "insights" ? null : id })
          }
          size="md"
        />
      </div>

      {activeTab === "insights" ? (
        <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
          <StrategyPlaybooks filter={filter} onFilterChange={setFilter} />
          <RightSidebar />
        </div>
      ) : (
        <Research4U />
      )}
    </div>
  );
}
