"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LoanListItem,
  PayrollDashboardData,
  PayrollFormOptions,
  PayrollRunListItem,
  SalaryStructureItem,
} from "../types";
import { PayrollDashboard } from "./payroll-dashboard";
import { RunsTable } from "./runs-table";
import { SalaryStructuresTable } from "./salary-structures-table";
import { LoansTable } from "./loans-table";

export function PayrollWorkspace({
  dashboard,
  runs,
  structures,
  loans,
  options,
  canProcess,
}: {
  dashboard: PayrollDashboardData;
  runs: PayrollRunListItem[];
  structures: SalaryStructureItem[];
  loans: LoanListItem[];
  options: PayrollFormOptions;
  canProcess: boolean;
}) {
  const [tab, setTab] = React.useState("overview");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="runs">Payroll runs</TabsTrigger>
        <TabsTrigger value="salary">Salary structures</TabsTrigger>
        <TabsTrigger value="loans">Loans</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <PayrollDashboard data={dashboard} />
      </TabsContent>
      <TabsContent value="runs">
        <RunsTable runs={runs} canProcess={canProcess} />
      </TabsContent>
      <TabsContent value="salary">
        <SalaryStructuresTable structures={structures} canManage={canProcess} />
      </TabsContent>
      <TabsContent value="loans">
        <LoansTable loans={loans} options={options} canManage={canProcess} />
      </TabsContent>
    </Tabs>
  );
}
