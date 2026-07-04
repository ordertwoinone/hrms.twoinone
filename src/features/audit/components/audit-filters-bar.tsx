"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUDIT_ACTIONS, entityLabel } from "../constants";
import type { AuditFilterOptions } from "../types";

interface AuditFiltersBarProps {
  options: AuditFilterOptions;
}

const ALL = "__all__";

export function AuditFiltersBar({ options }: AuditFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    search: searchParams.get("search") ?? "",
    action: searchParams.get("action") ?? "",
    entity: searchParams.get("entity") ?? "",
    actorId: searchParams.get("actorId") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  };

  const [search, setSearch] = React.useState(current.search);

  function pushParams(overrides: Partial<typeof current>) {
    const next = { ...current, ...overrides };
    const params = new URLSearchParams();
    params.set("page", "1");
    if (next.search) params.set("search", next.search);
    if (next.action) params.set("action", next.action);
    if (next.entity) params.set("entity", next.entity);
    if (next.actorId) params.set("actorId", next.actorId);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search });
  }

  const hasFilters =
    current.search ||
    current.action ||
    current.entity ||
    current.actorId ||
    current.from ||
    current.to;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + clear */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by entity ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          <SlidersHorizontal className="mr-1.5 size-4" />
          Filter
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
          >
            <X className="mr-1.5 size-4" />
            Clear
          </Button>
        )}
      </form>

      {/* Dropdown filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={current.action || ALL}
          onValueChange={(v) => pushParams({ action: v === ALL ? "" : v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All actions</SelectItem>
            {AUDIT_ACTIONS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={current.entity || ALL}
          onValueChange={(v) => pushParams({ entity: v === ALL ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All entities</SelectItem>
            {options.entities.map((e) => (
              <SelectItem key={e} value={e}>
                {entityLabel(e)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={current.actorId || ALL}
          onValueChange={(v) => pushParams({ actorId: v === ALL ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All users</SelectItem>
            {options.actors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={current.from}
          onChange={(e) => pushParams({ from: e.target.value })}
          className="w-[150px]"
          placeholder="From date"
          title="From date"
        />
        <Input
          type="date"
          value={current.to}
          onChange={(e) => pushParams({ to: e.target.value })}
          className="w-[150px]"
          placeholder="To date"
          title="To date"
        />
      </div>
    </div>
  );
}
