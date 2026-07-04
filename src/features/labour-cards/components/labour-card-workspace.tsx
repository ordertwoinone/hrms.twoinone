"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LabourCardDashboardData,
  LabourCardFormOptions,
  LabourCardListItem,
} from "../types";
import { LabourCardDashboard } from "./labour-card-dashboard";
import { LabourCardsTable } from "./labour-cards-table";

export function LabourCardWorkspace({
  dashboard,
  records,
  options,
  canManage,
}: {
  dashboard: LabourCardDashboardData;
  records: LabourCardListItem[];
  options: LabourCardFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All labour cards</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <LabourCardDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <LabourCardsTable
          records={records}
          options={options}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}
