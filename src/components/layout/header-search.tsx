"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openCommandMenu } from "./command-menu";

/**
 * Header search affordance. On desktop it's a faux input that opens the command
 * palette; on mobile it collapses to an icon button. Keeps a single search
 * entry point (the ⌘K palette) instead of a separate search field.
 */
export function HeaderSearch() {
  return (
    <>
      <button
        type="button"
        onClick={openCommandMenu}
        className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:border-ring/40 md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={openCommandMenu}
        aria-label="Search"
      >
        <Search className="text-muted-foreground" />
      </Button>
    </>
  );
}
