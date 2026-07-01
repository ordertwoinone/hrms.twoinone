"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { navigation } from "@/config/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * Global command palette (⌘K / Ctrl+K), Linear/Vercel-style. The header search
 * field opens it. Currently indexes navigation destinations; module-specific
 * commands (e.g. "Add employee") are registered here as modules are built.
 *
 * Exposes a tiny event-based API so the header search button can open it
 * without prop drilling.
 */
export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("hrms:open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hrms:open-command", onOpen);
    };
  }, []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigation.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => go(item.href)}
                >
                  <Icon />
                  {item.title}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Fire the global event that opens the command palette. */
export function openCommandMenu() {
  window.dispatchEvent(new Event("hrms:open-command"));
}
