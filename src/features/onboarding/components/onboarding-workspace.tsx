"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import type { ChecklistItem, TemplateItem } from "../queries/onboarding.queries";

interface Props {
  checklists: ChecklistItem[];
  templates: TemplateItem[];
}

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive",
};

export function OnboardingWorkspace({ checklists, templates }: Props) {
  const [tab, setTab] = useState<"onboarding" | "offboarding" | "templates">("onboarding");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList>
        <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        <TabsTrigger value="offboarding">Offboarding</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="onboarding" className="mt-4">
        <ChecklistTable rows={checklists.filter((c) => c.type === "onboarding")} />
      </TabsContent>

      <TabsContent value="offboarding" className="mt-4">
        <ChecklistTable rows={checklists.filter((c) => c.type === "offboarding")} />
      </TabsContent>

      <TabsContent value="templates" className="mt-4">
        {templates.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No templates" description="No checklist templates have been created yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell>{t.itemCount} tasks</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "active" ? "success" : "outline"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ChecklistTable({ rows }: { rows: ChecklistItem[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No checklists"
        description="No checklists have been created yet."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Checklist</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => {
            const pct = c.totalTasks > 0 ? Math.round((c.completedTasks / c.totalTasks) * 100) : 0;
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.employeeName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="w-24 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {c.completedTasks}/{c.totalTasks}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {c.targetDate ? format(new Date(c.targetDate + "T00:00:00"), "dd MMM yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status] ?? "default"}>
                    {c.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
