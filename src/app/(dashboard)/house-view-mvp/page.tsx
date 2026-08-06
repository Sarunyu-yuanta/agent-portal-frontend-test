"use client";

import { useState } from "react";
import { TabGroup } from "@sarunyu/system-one";
import { StrategyPlaybooks } from "./StrategyPlaybooks";
import { AIRecommendCard } from "./AIRecommendCard";
import { Research4U } from "./Research4U";

function RightSidebar() {
  return (
    <div className="flex flex-col gap-5 sticky top-6 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
      <AIRecommendCard />
    </div>
  );
}

export default function HouseViewPage() {
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="flex flex-col gap-6">
      <div className="transparent-tabs scrollable-tabs -mx-4 xl:-mx-6 pl-4 xl:pl-6">
        <TabGroup
          items={[
            { id: "insights",   title: "Insights" },
            { id: "research4u", title: "Research 4U" },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          size="md"
        />
      </div>

      {activeTab === "insights" ? (
        <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
          <StrategyPlaybooks />
          <RightSidebar />
        </div>
      ) : (
        <Research4U />
      )}
    </div>
  );
}
