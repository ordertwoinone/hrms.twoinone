"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

export type Density = "comfortable" | "compact";

/**
 * Generic, reusable TanStack data grid. Owns sorting, global search, column
 * visibility, row selection, density, pagination, and CSV export so every
 * module gets the same professional table with just `columns` + `data`.
 *
 * For large datasets switch to server-side pagination by passing pre-paginated
 * `data` and lifting the pagination/sorting state — the column contract is
 * unchanged.
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  /** Show the search/density/export/view toolbar. */
  toolbar?: boolean;
  /** Enable CSV export of the currently filtered rows. */
  enableExport?: boolean;
  /** Constrain table height to keep the header sticky while rows scroll. */
  maxHeight?: number;
  emptyState?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  toolbar = true,
  enableExport = false,
  maxHeight,
  emptyState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleExport = React.useCallback(() => {
    exportRowsToCsv(table);
  }, [table]);

  const cellPadding =
    density === "compact" ? "[&_td]:py-1.5 [&_th]:py-1.5" : "[&_td]:py-3";

  return (
    <div className="space-y-3">
      {toolbar ? (
        <DataTableToolbar
          table={table}
          density={density}
          onDensityChange={setDensity}
          searchPlaceholder={searchPlaceholder}
          onExport={enableExport ? handleExport : undefined}
        />
      ) : null}

      <div
        className="overflow-auto rounded-xl border bg-card"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <Table className={cn(cellPadding)}>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32">
                  {emptyState ?? (
                    <p className="text-center text-sm text-muted-foreground">
                      No results.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

/** Export the table's filtered rows (visible columns) to a downloaded CSV. */
function exportRowsToCsv<TData>(
  table: ReturnType<typeof useReactTable<TData>>,
): void {
  const columns = table
    .getVisibleLeafColumns()
    .filter((c) => typeof c.accessorFn !== "undefined");

  const escape = (val: unknown) => {
    const s = val == null ? "" : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = columns.map((c) => escape(c.id)).join(",");
  const rows = table
    .getFilteredRowModel()
    .rows.map((row) =>
      columns.map((c) => escape(row.getValue(c.id))).join(","),
    );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "export.csv";
  link.click();
  URL.revokeObjectURL(url);
}
