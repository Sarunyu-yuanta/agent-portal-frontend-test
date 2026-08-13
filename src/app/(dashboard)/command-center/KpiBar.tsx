"use client";

import { Card, Tag } from "@sarunyu/system-one";
import { kpiItems } from "./command-center-data";

export function KpiBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiItems.map((item) => (
        <Card
          key={item.label}
          variant="default"
          className="flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="type-caption text-muted-foreground">{item.label}</p>
            <Tag text={item.delta} variant={item.deltaVariant} size="small" />
          </div>
          <p className="type-h3 text-foreground leading-none">{item.value}</p>
          {item.progress !== null ? (
            <div className="flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-action transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="type-caption text-[var(--text-default-disabled)]">
                {item.target}
              </p>
            </div>
          ) : (
            <p className="type-caption text-[var(--text-default-disabled)]">
              {item.target}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
