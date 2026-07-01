"use client";

import type { Table } from "@tanstack/react-table";
import { Download, Rows2, Rows3, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableViewOptions } from "./data-table-view-options";
import type { Density } from "./data-table";

/**
 * Toolbar above the data grid: global search, an active-filter reset, a
 * comfortable/compact density toggle, column visibility, and optional export.
 */
export function DataTableToolbar<TData>({
  table,
  density,
  onDensityChange,
  searchPlaceholder = "Search…",
  onExport,
}: {
  table: Table<TData>;
  density: Density;
  onDensityChange: (density: Density) => void;
  searchPlaceholder?: string;
  onExport?: () => void;
}) {
  const value = (table.getState().globalFilter as string) ?? "";
  const isFiltered = value.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pl-9"
        />
        {isFiltered ? (
          <button
            type="button"
            onClick={() => table.setGlobalFilter("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="size-9"
              aria-label="Toggle density"
              onClick={() =>
                onDensityChange(
                  density === "comfortable" ? "compact" : "comfortable",
                )
              }
            >
              {density === "comfortable" ? (
                <Rows3 className="size-4" />
              ) : (
                <Rows2 className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {density === "comfortable" ? "Compact rows" : "Comfortable rows"}
          </TooltipContent>
        </Tooltip>

        {onExport ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onExport}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        ) : null}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
