"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  InsuranceDashboardData,
  PolicyFormOptions,
  PolicyListItem,
} from "../types";
import { InsuranceDashboard } from "./insurance-dashboard";
import { PoliciesTable } from "./policies-table";

export function InsuranceWorkspace({
  dashboard,
  records,
  options,
  canManage,
}: {
  dashboard: InsuranceDashboardData;
  records: PolicyListItem[];
  options: PolicyFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All policies</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <InsuranceDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <PoliciesTable
          records={records}
          options={options}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}
