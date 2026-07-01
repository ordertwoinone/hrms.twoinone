"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/config/roles";
import { getInitials } from "@/utils/format";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * User profile block pinned to the bottom of the sidebar. Opens a menu with
 * profile, settings, and sign-out. Collapses to just the avatar on the
 * collapsed rail.
 */
export function SidebarUser({ collapsed = false }: { collapsed?: boolean }) {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const avatar = (
    <Avatar className="size-8">
      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(user.fullName)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="border-t border-sidebar-border p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-colors hover:bg-sidebar-muted focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              collapsed && "justify-center p-1.5",
            )}
          >
            {avatar}
            {!collapsed && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          className="w-56"
          sideOffset={8}
        >
          <DropdownMenuLabel className="flex flex-col">
            <span>{user.fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={ROUTES.profile}>
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.settings}>
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void signOut();
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
