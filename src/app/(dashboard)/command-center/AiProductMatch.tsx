"use client";

import { Button } from "@sarunyu/system-one";
import { SparkleIcon } from "@phosphor-icons/react";

export function AiProductMatch() {
  return (
    <div className="rounded-xl bg-slate-900 dark:bg-slate-800 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SparkleIcon size={16} className="text-yellow-400" weight="fill" />
        <p className="type-subtitle-2 text-white">AI Product Match</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="type-body-2 text-slate-300 leading-snug">
          <span className="text-white font-semibold">
            Structured Note Series 12
          </span>{" "}
          launched today — 8.5% p.a., 6-month tenor.
        </p>
        <p className="type-caption text-slate-400">
          AI matched{" "}
          <span className="text-white font-medium">5 UHNW clients</span> in your
          book.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {["Somchai Rattanakul", "Nattaporn Chaiwong"].map((name, i) => (
          <div
            key={name}
            className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
          >
            <p className="type-caption text-slate-200">{name}</p>
            <span className="text-[11px] font-bold text-green-400">
              {i === 0 ? "94%" : "88%"} match
            </span>
          </div>
        ))}
      </div>
      <Button variant="primary" size="lg">
        Launch Micro-Campaign
      </Button>
    </div>
  );
}
