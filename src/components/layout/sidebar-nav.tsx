"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { navigation, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Primary sidebar navigation. Renders grouped items from the central config,
 * hides entries the user lacks permission for, highlights the active route, and
 * supports notification badges and expandable sub-navigation. When the rail is
 * collapsed, items become icon-only with hover tooltips.
 *
 * Shared by the desktop sidebar and the mobile sheet so navigation lives in one
 * place.
 */
export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { can } = usePermissions();

  const isActive = React.useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {navigation.map((group) => {
        const visibleItems = group.items.filter(
          (item) => item.permission === null || can(item.permission),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label} className="flex flex-col gap-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                {group.label}
              </p>
            )}
            {visibleItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarNavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = React.useState(active);

  const baseClasses = cn(
    "group/navitem relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-200",
    "text-sidebar-foreground hover:bg-sidebar-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    active &&
      "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    collapsed && "justify-center px-0",
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-5 shrink-0",
          active
            ? "text-sidebar-accent-foreground"
            : "text-muted-foreground group-hover/navitem:text-foreground",
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
      {!collapsed && item.badge ? (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
          {item.badge}
        </span>
      ) : null}
      {!collapsed && hasChildren ? (
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      ) : null}
    </>
  );

  // Collapsed rail: icon-only trigger with a tooltip label.
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} onClick={onNavigate} className={baseClasses}>
            {content}
            {item.badge ? (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
            ) : null}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  // Expandable parent (renders a toggle instead of a link).
  if (hasChildren) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(baseClasses, "w-full text-left")}
          aria-expanded={open}
        >
          {content}
        </button>
        {open && (
          <div className="ml-4 flex flex-col gap-1 border-l border-sidebar-border pl-3">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className="rounded-md px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-muted hover:text-foreground"
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={baseClasses}
    >
      {content}
    </Link>
  );
}
