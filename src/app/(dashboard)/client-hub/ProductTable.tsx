"use client";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@sarunyu/system-one";
import { displayAssetLabel, formatThbAmount } from "@/lib/client-utils";
import type { ProductRow } from "@/types/domain";

export function ProductTable({
  rows,
  onRowClick,
}: {
  rows: ProductRow[];
  onRowClick: (row: ProductRow) => void;
}) {
  return (
    <div className="overflow-x-auto overflow-y-hidden table-scroll rounded-lg border border-[var(--border-default)]">
      <Table className="table-fixed min-w-[640px]">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
            <TableHeaderCell className="w-[30%]">Product</TableHeaderCell>
            <TableHeaderCell className="w-[18%] whitespace-nowrap"># Clients</TableHeaderCell>
            <TableHeaderCell className="w-[26%] whitespace-nowrap">Total AUM (THB)</TableHeaderCell>
            <TableHeaderCell className="w-[21%] whitespace-nowrap">Avg Allocation</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.label}
              className="cursor-pointer"
              hoverable
              onClick={() => onRowClick(row)}
            >
              <TableCell>
                <p className="text-[13px] text-muted-foreground">{index + 1}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="relative shrink-0 size-2">
                    <img alt="" className="block size-full max-w-none" src={row.statusIcon} />
                  </span>
                  <p className="text-[14px] font-semibold text-foreground truncate">{displayAssetLabel(row.label)}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-[14px] font-semibold text-foreground">{row.clientCount}</p>
              </TableCell>
              <TableCell>
                <p className="text-[14px] font-semibold text-foreground">{formatThbAmount(row.totalAmountThb)}</p>
              </TableCell>
              <TableCell>
                <p className="text-[14px] font-semibold text-foreground">{row.avgAllocationPct.toFixed(1)}%</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
