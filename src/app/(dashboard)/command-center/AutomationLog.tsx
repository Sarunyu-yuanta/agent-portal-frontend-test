"use client";

import { CheckCircleIcon, ClockIcon } from "@phosphor-icons/react";
import { automationLog } from "./command-center-data";

export function AutomationLog() {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-subtitle-1 text-foreground">Today&apos;s Automation</p>
      <div className="flex flex-col">
        {automationLog.map((entry, i) => (
          <div key={entry.id} className="flex gap-3 group">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  entry.done ? "bg-success/15" : "bg-muted"
                }`}
              >
                {entry.done ? (
                  <CheckCircleIcon
                    size={12}
                    className="text-success"
                    weight="fill"
                  />
                ) : (
                  <ClockIcon
                    size={12}
                    className="text-muted-foreground"
                    weight="regular"
                  />
                )}
              </div>
              {i < automationLog.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>
            {/* Content */}
            <div className="pb-3 flex-1 min-w-0">
              <p className="type-body-2 text-foreground leading-snug">
                {entry.label}
              </p>
              <p className="type-caption text-muted-foreground">{entry.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
