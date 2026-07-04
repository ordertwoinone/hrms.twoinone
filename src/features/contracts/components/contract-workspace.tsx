"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ContractDashboardData,
  ContractFormOptions,
  ContractListItem,
} from "../types";
import { ContractDashboard } from "./contract-dashboard";
import { ContractsTable } from "./contracts-table";

export function ContractWorkspace({
  dashboard,
  contracts,
  options,
  canManage,
}: {
  dashboard: ContractDashboardData;
  contracts: ContractListItem[];
  options: ContractFormOptions;
  canManage: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="all">All contracts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ContractDashboard
          data={dashboard}
          canManage={canManage}
          onViewAll={() => setTab("all")}
        />
      </TabsContent>

      <TabsContent value="all">
        <ContractsTable
          contracts={contracts}
          options={options}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}
