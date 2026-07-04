"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VisaDashboardData, VisaFormOptions, VisaListItem } from "../types";
import { VisaDashboard } from "./visa-dashboard";
import { VisasTable } from "./visas-table";

export function VisaWorkspace({
  dashboard,
  visas,
  options,
  canManage,
}: {
  dashboard: VisaDashboardData;
  visas: VisaListItem[];
  options: VisaFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All visas</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <VisaDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <VisasTable visas={visas} options={options} canManage={canManage} />
      </TabsContent>
    </Tabs>
  );
}
