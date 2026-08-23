import { TableRow, TableCell } from "@sarunyu/system-one";

/** Base pulsing placeholder block — size it via `className`. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[var(--fill-gray-200)] ${className}`}
    />
  );
}

/** Drop-in replacement for a table's row list while its data is still loading. */
export function TableRowsSkeleton({
  columns,
  rows = 8,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
