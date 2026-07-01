"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Company / workspace switcher for multi-entity tenants. STRUCTURE ONLY — the
 * company list is a placeholder until tenancy is wired; selection is local
 * state for now.
 */
interface Company {
  id: string;
  name: string;
}

const COMPANIES: Company[] = [
  { id: "1", name: "Acme Trading LLC" },
  { id: "2", name: "Acme Logistics FZE" },
];

export function CompanySwitcher() {
  const [active, setActive] = React.useState<Company>(COMPANIES[0]!);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="size-3.5" />
          </span>
          <span className="hidden max-w-[10rem] truncate sm:inline">
            {active.name}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Companies
        </DropdownMenuLabel>
        {COMPANIES.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onSelect={() => setActive(company)}
            className="gap-2"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-3.5" />
            </span>
            <span className="flex-1 truncate">{company.name}</span>
            <Check
              className={cn(
                "size-4 text-primary",
                active.id === company.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="size-4" />
          Add company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
