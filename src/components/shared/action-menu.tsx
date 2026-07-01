"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Reusable row/entity action menu (the "⋯" overflow). Used in table rows and
 * card headers so per-item actions look and behave consistently everywhere.
 * Pass groups (arrays of items) to get separators between them.
 */
export function ActionMenu({
  label = "Actions",
  groups,
  align = "end",
}: {
  label?: string;
  groups: ActionMenuItem[][];
  align?: "start" | "end" | "center";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className="text-muted-foreground data-[state=open]:bg-accent"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.label}
                  disabled={item.disabled}
                  onSelect={(e) => {
                    e.preventDefault();
                    item.onSelect();
                  }}
                  className={
                    item.destructive
                      ? "text-destructive focus:text-destructive"
                      : undefined
                  }
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
