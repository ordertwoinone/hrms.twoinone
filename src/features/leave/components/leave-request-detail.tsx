"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Download,
  Loader2,
  Paperclip,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate, formatDateTime } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/types/common";
import {
  getLeaveAttachmentUrlAction,
  hrApproveLeave,
  managerApproveLeave,
  rejectLeave,
} from "../actions/leave.actions";
import { leaveEventLabel } from "../constants";
import type { LeaveRequestDetail } from "../types";
import { LeaveStatusBadge } from "./leave-status-badge";

type ReviewFn = (input: {
  request_id: string;
  note?: string;
}) => Promise<ActionResult<{ ok: boolean }>>;

function Meta({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export function LeaveRequestDetailView({
  detail,
  canApprove,
  canManage,
}: {
  detail: LeaveRequestDetail;
  canApprove: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [downloading, setDownloading] = React.useState(false);
  const [review, setReview] = React.useState<{
    fn: ReviewFn;
    title: string;
    description: string;
    confirmLabel: string;
    destructive: boolean;
    requireNote: boolean;
  } | null>(null);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onDownload() {
    setDownloading(true);
    const result = await getLeaveAttachmentUrlAction(detail.id);
    setDownloading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  async function submitReview() {
    if (!review) return;
    if (review.requireNote && !note.trim()) {
      toast.error("Please add a reason for rejection.");
      return;
    }
    setSubmitting(true);
    const result = await review.fn({
      request_id: detail.id,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Request updated.");
    setReview(null);
    setNote("");
    router.refresh();
  }

  // Which workflow actions are available at this stage.
  const showManagerApprove = canApprove && detail.status === "pending";
  const showHrApprove =
    canManage &&
    (detail.status === "manager_approved" || detail.status === "pending");
  const showReject =
    (canApprove || canManage) &&
    (detail.status === "pending" || detail.status === "manager_approved");
  const hasActions = showManagerApprove || showHrApprove || showReject;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg">{detail.employeeName}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{detail.leaveTypeName}</Badge>
                <Badge variant={detail.leaveTypeIsPaid ? "success" : "warning"}>
                  {detail.leaveTypeIsPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
            </div>
            <LeaveStatusBadge status={detail.status} />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Meta icon={Calendar} label="Dates">
                {detail.isHalfDay
                  ? `${formatDate(detail.startDate)} (half day${
                      detail.halfDayPeriod
                        ? ` · ${detail.halfDayPeriod} half`
                        : ""
                    })`
                  : detail.startDate === detail.endDate
                    ? formatDate(detail.startDate)
                    : `${formatDate(detail.startDate)} → ${formatDate(
                        detail.endDate,
                      )}`}
              </Meta>
              <Meta icon={Clock} label="Total days">
                {detail.totalDays}
              </Meta>
              <Meta icon={User} label="Reports to">
                {detail.managerName ?? "—"}
              </Meta>
              <Meta icon={Calendar} label="Applied on">
                {formatDate(detail.createdAt)}
              </Meta>
            </div>

            {detail.reason ? (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {detail.reason}
                  </p>
                </div>
              </>
            ) : null}

            {detail.attachmentUrl ? (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">
                      {detail.attachmentName ?? "Attachment"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download
                  </Button>
                </div>
              </>
            ) : null}

            {hasActions ? (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {showManagerApprove ? (
                    <Button
                      onClick={() =>
                        setReview({
                          fn: managerApproveLeave,
                          title: "Approve as manager",
                          description:
                            "This forwards the request to HR for final approval.",
                          confirmLabel: "Approve",
                          destructive: false,
                          requireNote: false,
                        })
                      }
                    >
                      <Check className="size-4" />
                      Approve (Manager)
                    </Button>
                  ) : null}
                  {showHrApprove ? (
                    <Button
                      onClick={() =>
                        setReview({
                          fn: hrApproveLeave,
                          title: "Approve as HR",
                          description:
                            "This grants the leave and updates the employee’s balance.",
                          confirmLabel: "Approve",
                          destructive: false,
                          requireNote: false,
                        })
                      }
                    >
                      <CheckCheck className="size-4" />
                      Approve (HR)
                    </Button>
                  ) : null}
                  {showReject ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setReview({
                          fn: rejectLeave,
                          title: "Reject request",
                          description:
                            "The employee will be notified this request was rejected.",
                          confirmLabel: "Reject",
                          destructive: true,
                          requireNote: true,
                        })
                      }
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Approval timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ol className="relative space-y-6 border-l pl-6">
              {detail.events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[27px] top-0.5 flex size-3 items-center justify-center rounded-full border-2 border-background bg-primary" />
                  <p className="text-sm font-medium">
                    {leaveEventLabel(event.action)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.actorName ?? "System"} ·{" "}
                    {formatDateTime(event.createdAt)}
                  </p>
                  {event.note ? (
                    <p className="mt-1 rounded-md bg-muted px-2 py-1 text-xs">
                      {event.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open) {
            setReview(null);
            setNote("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{review?.title}</DialogTitle>
            <DialogDescription>{review?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Note{" "}
              {review?.requireNote ? (
                <span className="text-destructive">*</span>
              ) : (
                <span className="text-muted-foreground">(optional)</span>
              )}
            </label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the record…"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReview(null);
                setNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={review?.destructive ? "destructive" : "default"}
              onClick={submitReview}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {review?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
