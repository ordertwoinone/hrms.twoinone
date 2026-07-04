"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  IdNameOption,
  LeaveCalendarEntry,
  LeaveDashboardData,
  LeaveFormOptions,
  LeaveRequestListItem,
  LeaveType,
} from "../types";
import { LeaveDashboard } from "./leave-dashboard";
import { LeaveRequestsTable } from "./leave-requests-table";
import { LeaveCalendar } from "./leave-calendar";
import { LeaveBalancesPanel } from "./leave-balances-panel";
import { LeaveTypesManager } from "./leave-types-manager";

export function LeaveWorkspace({
  dashboard,
  requests,
  formOptions,
  employees,
  leaveTypes,
  calendar,
  permissions,
}: {
  dashboard: LeaveDashboardData;
  requests: LeaveRequestListItem[];
  formOptions: LeaveFormOptions;
  employees: IdNameOption[];
  leaveTypes: LeaveType[];
  calendar: {
    year: number;
    month: number;
    leaves: LeaveCalendarEntry[];
    holidays: { date: string; name: string }[];
  };
  permissions: {
    canRequest: boolean;
    canApprove: boolean;
    canManage: boolean;
  };
}) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        {permissions.canManage ? (
          <TabsTrigger value="types">Leave types</TabsTrigger>
        ) : null}
      </TabsList>

      <TabsContent value="overview">
        <LeaveDashboard data={dashboard} />
      </TabsContent>

      <TabsContent value="requests">
        <LeaveRequestsTable
          requests={requests}
          options={formOptions}
          canRequest={permissions.canRequest}
        />
      </TabsContent>

      <TabsContent value="calendar">
        <LeaveCalendar
          initialYear={calendar.year}
          initialMonth={calendar.month}
          initialLeaves={calendar.leaves}
          initialHolidays={calendar.holidays}
        />
      </TabsContent>

      <TabsContent value="balances">
        <LeaveBalancesPanel
          employees={employees}
          canManage={permissions.canManage}
        />
      </TabsContent>

      {permissions.canManage ? (
        <TabsContent value="types">
          <LeaveTypesManager
            leaveTypes={leaveTypes}
            canManage={permissions.canManage}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
