"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Calculator, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { PayrollRunForWPS } from "../queries/wps.queries";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface GratuityInputs {
  basicSalary: number;
  yearsOfService: number;
  terminationType: "resigned" | "dismissed";
}

function calcGratuity({ basicSalary, yearsOfService, terminationType }: GratuityInputs): number {
  if (yearsOfService < 1) return 0;
  const dailySalary = (basicSalary * 12) / 365;

  let gratuity = 0;

  if (terminationType === "dismissed") {
    const first5 = Math.min(yearsOfService, 5);
    gratuity += first5 * 21 * dailySalary;
    if (yearsOfService > 5) {
      gratuity += (yearsOfService - 5) * 30 * dailySalary;
    }
  } else {
    // Resigned: reduced rate for first 3-5 years
    if (yearsOfService < 1) return 0;
    if (yearsOfService < 3) return 0;
    if (yearsOfService < 5) {
      gratuity = Math.min(yearsOfService, 5) * 21 * dailySalary * (2 / 3);
    } else if (yearsOfService < 10) {
      gratuity = Math.min(5, yearsOfService) * 21 * dailySalary * (5 / 6);
      if (yearsOfService > 5) {
        gratuity += (yearsOfService - 5) * 30 * dailySalary * (5 / 6);
      }
    } else {
      gratuity = 5 * 21 * dailySalary;
      if (yearsOfService > 5) {
        gratuity += (yearsOfService - 5) * 30 * dailySalary;
      }
    }
  }

  return Math.min(gratuity, basicSalary * 24);
}

interface Props {
  payrollRuns: PayrollRunForWPS[];
}

export function WpsWorkspace({ payrollRuns }: Props) {
  const [basicSalary, setBasicSalary] = useState("");
  const [yearsOfService, setYearsOfService] = useState("");
  const [terminationType, setTerminationType] = useState<"resigned" | "dismissed">("dismissed");
  const [gratuityResult, setGratuityResult] = useState<number | null>(null);

  function calcHandler() {
    const salary = parseFloat(basicSalary);
    const years = parseFloat(yearsOfService);
    if (!salary || !years || salary <= 0 || years < 0) {
      toast.error("Enter valid salary and years of service");
      return;
    }
    const result = calcGratuity({ basicSalary: salary, yearsOfService: years, terminationType });
    setGratuityResult(result);
  }

  function downloadSIF(run: PayrollRunForWPS) {
    const monthLabel = MONTHS[(run.periodMonth - 1) % 12] ?? "";
    const content = [
      "SIF|1.0",
      `EDR|${run.id}|${run.periodYear}${String(run.periodMonth).padStart(2, "0")}|AED`,
      `TRH|${run.employeeCount}|${run.totalNet.toFixed(2)}`,
      "EOF",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SIF_${monthLabel}_${run.periodYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SIF file downloaded");
  }

  return (
    <Tabs defaultValue="payroll">
      <TabsList>
        <TabsTrigger value="payroll">WPS Payroll Runs</TabsTrigger>
        <TabsTrigger value="gratuity">Gratuity Calculator</TabsTrigger>
      </TabsList>

      <TabsContent value="payroll" className="mt-4">
        {payrollRuns.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No approved payroll runs"
            description="Approve payroll runs first to generate SIF files."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Total Net (AED)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {MONTHS[(run.periodMonth - 1) % 12]} {run.periodYear}
                    </TableCell>
                    <TableCell>{run.employeeCount}</TableCell>
                    <TableCell>
                      {run.totalNet.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={run.status === "paid" ? "success" : "default"}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {run.approvedAt
                        ? format(new Date(run.approvedAt), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSIF(run)}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        SIF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="gratuity" className="mt-4">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" />
              UAE Labor Law Gratuity Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Basic Monthly Salary (AED)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 5000"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Years of Service</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 3.5"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Termination Type</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="terminationType"
                    value="dismissed"
                    checked={terminationType === "dismissed"}
                    onChange={() => setTerminationType("dismissed")}
                  />
                  <span className="text-sm">Dismissed / Completed Contract</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="terminationType"
                    value="resigned"
                    checked={terminationType === "resigned"}
                    onChange={() => setTerminationType("resigned")}
                  />
                  <span className="text-sm">Resigned</span>
                </label>
              </div>
            </div>

            <Button onClick={calcHandler} className="w-full">Calculate Gratuity</Button>

            {gratuityResult !== null && (
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Estimated Gratuity Entitlement</p>
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">
                  AED {gratuityResult.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on UAE Labor Law (Art. 51). Capped at 2 years&apos; salary. Consult HR/legal for exact entitlement.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
