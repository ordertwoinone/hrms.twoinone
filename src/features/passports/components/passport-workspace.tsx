"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PassportDashboardData,
  PassportFormOptions,
  PassportListItem,
} from "../types";
import { PassportDashboard } from "./passport-dashboard";
import { PassportsTable } from "./passports-table";

export function PassportWorkspace({
  dashboard,
  records,
  options,
  canManage,
}: {
  dashboard: PassportDashboardData;
  records: PassportListItem[];
  options: PassportFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All passports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <PassportDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <PassportsTable
          records={records}
          options={options}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}
