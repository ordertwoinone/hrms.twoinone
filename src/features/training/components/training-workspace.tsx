"use client";

import { format } from "date-fns";
import { GraduationCap, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import type { CourseItem, EnrollmentItem } from "../queries/training.queries";

interface Props {
  courses: CourseItem[];
  enrollments: EnrollmentItem[];
}

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  draft: "outline",
  published: "primary",
  completed: "success",
  cancelled: "destructive",
};

const ENROLL_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  enrolled: "outline",
  in_progress: "warning",
  completed: "success",
  failed: "destructive",
  withdrawn: "default",
};

const MODE_BADGE: Record<string, string> = {
  internal: "bg-teal-100 text-teal-800",
  external: "bg-blue-100 text-blue-800",
  online: "bg-purple-100 text-purple-800",
};

export function TrainingWorkspace({ courses, enrollments }: Props) {
  return (
    <Tabs defaultValue="courses">
      <TabsList>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
      </TabsList>

      <TabsContent value="courses" className="mt-4">
        {courses.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No courses" description="No training courses have been created yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => {
                  const compPct = c.enrolledCount > 0
                    ? Math.round((c.completedCount / c.enrolledCount) * 100)
                    : 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.title}</p>
                          {c.category && (
                            <p className="text-xs text-muted-foreground">{c.category}</p>
                          )}
                          {c.provider && (
                            <p className="text-xs text-muted-foreground">by {c.provider}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODE_BADGE[c.mode] ?? "bg-muted"}`}>
                          {c.mode}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.durationHours ? `${c.durationHours}h` : "—"}
                      </TableCell>
                      <TableCell>
                        {c.enrolledCount}
                        {c.maxSeats ? ` / ${c.maxSeats}` : ""}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={compPct} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground">{compPct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[c.status] ?? "default"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="enrollments" className="mt-4">
        {enrollments.length === 0 ? (
          <EmptyState icon={Users} title="No enrollments" description="No employees have been enrolled in courses yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{e.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{e.employeeNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{e.courseTitle}</TableCell>
                    <TableCell>
                      <Badge variant={ENROLL_VARIANT[e.status] ?? "default"}>
                        {e.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{e.score != null ? `${e.score}%` : "—"}</TableCell>
                    <TableCell>
                      {e.completionDate
                        ? format(new Date(e.completionDate + "T00:00:00"), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(e.enrolledAt), "dd MMM yyyy")}
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
