"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EidDashboardData, EidFormOptions, EidListItem } from "../types";
import { EmiratesIdDashboard } from "./emirates-id-dashboard";
import { EmiratesIdsTable } from "./emirates-ids-table";

export function EmiratesIdWorkspace({
  dashboard,
  records,
  options,
  canManage,
}: {
  dashboard: EidDashboardData;
  records: EidListItem[];
  options: EidFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All Emirates IDs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EmiratesIdDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <EmiratesIdsTable
          records={records}
          options={options}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}
