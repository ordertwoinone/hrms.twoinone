"use client";

import { format } from "date-fns";
import { TrendingUp, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { CycleItem, ReviewItem } from "../queries/performance.queries";

interface Props {
  cycles: CycleItem[];
  reviews: ReviewItem[];
}

const CYCLE_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  draft: "outline",
  active: "success",
  closed: "default",
};

const REVIEW_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid"> = {
  pending: "outline",
  in_progress: "warning",
  submitted: "primary",
  acknowledged: "success",
};

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export function PerformanceWorkspace({ cycles, reviews }: Props) {
  return (
    <Tabs defaultValue="cycles">
      <TabsList>
        <TabsTrigger value="cycles">Review Cycles</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="cycles" className="mt-4">
        {cycles.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No cycles" description="No performance review cycles have been created." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Self-Review Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(c.startDate + "T00:00:00"), "dd MMM yyyy")}
                      {" – "}
                      {format(new Date(c.endDate + "T00:00:00"), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={CYCLE_VARIANT[c.status] ?? "default"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.reviewCount}</TableCell>
                    <TableCell>{c.submittedCount}</TableCell>
                    <TableCell>
                      {c.selfReviewDeadline
                        ? format(new Date(c.selfReviewDeadline + "T00:00:00"), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        {reviews.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No reviews" description="No reviews have been submitted yet." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{r.employeeName}</p>
                        {r.reviewerName && (
                          <p className="text-xs text-muted-foreground">by {r.reviewerName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{r.cycleName}</TableCell>
                    <TableCell className="capitalize">{r.type.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge variant={REVIEW_VARIANT[r.status] ?? "default"}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell><RatingStars rating={r.overallRating} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {r.submittedAt ? format(new Date(r.submittedAt), "dd MMM yyyy") : "—"}
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
