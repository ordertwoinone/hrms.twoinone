"use client";

import Link from "next/link";
import { Plus, UserPlus, CalendarPlus, Wallet, FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";

/**
 * Header "quick action" button — a primary entry point for the most common
 * create actions across modules. Destinations resolve as each module is built.
 */
const ACTIONS = [
  { label: "Add employee", href: ROUTES.employees, icon: UserPlus },
  { label: "New leave request", href: ROUTES.leave, icon: CalendarPlus },
  { label: "Run payroll", href: ROUTES.payroll, icon: Wallet },
  { label: "Upload document", href: ROUTES.documents, icon: FileUp },
] as const;

export function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Plus className="size-4" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Quick actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem key={action.label} asChild>
              <Link href={action.href}>
                <Icon className="size-4 text-muted-foreground" />
                {action.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
