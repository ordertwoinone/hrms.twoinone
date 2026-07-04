"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalyticsOverview, ReportDataset } from "../types";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { ReportExplorer } from "./report-explorer";

export function ReportsWorkspace({
  overview,
  initialDataset,
}: {
  overview: AnalyticsOverview;
  initialDataset: ReportDataset;
}) {
  return (
    <Tabs defaultValue="dashboard" className="space-y-4">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <AnalyticsDashboard data={overview} />
      </TabsContent>
      <TabsContent value="reports">
        <ReportExplorer initialDataset={initialDataset} />
      </TabsContent>
    </Tabs>
  );
}
