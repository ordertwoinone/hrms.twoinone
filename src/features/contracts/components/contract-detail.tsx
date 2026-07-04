"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarRange,
  Check,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate, formatDateTime } from "@/utils";
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
  approveContract,
  getContractDocUrlAction,
  rejectContract,
  submitContract,
  terminateContract,
} from "../actions/contract.actions";
import { contractEventLabel } from "../constants";
import type { ContractDetail } from "../types";
import { ContractStatusBadge, ExpiryBadge } from "./contract-badges";

type ReviewFn = (input: {
  contract_id: string;
  note?: string;
}) => Promise<ActionResult<{ ok: boolean }>>;

type DocKind = "offer_letter" | "contract" | "attachment";

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

export function ContractDetailView({
  detail,
  canManage,
  canApprove,
}: {
  detail: ContractDetail;
  canManage: boolean;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [downloading, setDownloading] = React.useState<DocKind | null>(null);
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

  async function onDownload(kind: DocKind) {
    setDownloading(kind);
    const result = await getContractDocUrlAction(detail.id, kind);
    setDownloading(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  async function submitReview() {
    if (!review) return;
    if (review.requireNote && !note.trim()) {
      toast.error("Please add a note.");
      return;
    }
    setSubmitting(true);
    const result = await review.fn({
      contract_id: detail.id,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Contract updated.");
    setReview(null);
    setNote("");
    router.refresh();
  }

  const showSubmit = canManage && detail.status === "draft";
  const showApprove = canApprove && detail.status === "pending";
  const showReject = canApprove && detail.status === "pending";
  const showTerminate = canManage && detail.status === "active";
  const hasActions = showSubmit || showApprove || showReject || showTerminate;

  const docs: { kind: DocKind; label: string; name: string | null }[] = [
    { kind: "offer_letter", label: "Offer letter", name: detail.offerLetterName },
    { kind: "contract", label: "Employment contract", name: detail.contractName },
    { kind: "attachment", label: "Attachment", name: detail.attachmentName },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg">{detail.employeeName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {detail.contractType} contract
                {detail.employeeCode ? ` · ${detail.employeeCode}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <ContractStatusBadge status={detail.status} />
              <ExpiryBadge
                level={detail.expiryLevel}
                daysToExpiry={detail.daysToExpiry}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Meta icon={CalendarRange} label="Term">
                {formatDate(detail.startDate)} –{" "}
                {detail.endDate ? formatDate(detail.endDate) : "Open-ended"}
              </Meta>
              <Meta icon={CalendarClock} label="Notice period">
                {detail.noticePeriodDays} days
              </Meta>
              <Meta icon={RefreshCw} label="Renewal date">
                {detail.renewalDate ? formatDate(detail.renewalDate) : "—"}
              </Meta>
              <Meta icon={ShieldCheck} label="Approval">
                {detail.approvedByName
                  ? `${detail.approvedByName} · ${formatDate(detail.approvedAt)}`
                  : detail.submittedAt
                    ? "Pending"
                    : "Not submitted"}
              </Meta>
            </div>

            {detail.notes ? (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {detail.notes}
                  </p>
                </div>
              </>
            ) : null}

            <Separator />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Documents</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {docs.map((doc) => (
                  <div
                    key={doc.kind}
                    className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs">{doc.label}</span>
                    </div>
                    {doc.name ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download ${doc.label}`}
                        onClick={() => onDownload(doc.kind)}
                        disabled={downloading === doc.kind}
                      >
                        {downloading === doc.kind ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        None
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {hasActions ? (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {showSubmit ? (
                    <Button
                      onClick={() =>
                        setReview({
                          fn: submitContract,
                          title: "Submit for approval",
                          description:
                            "This sends the contract to an approver for review.",
                          confirmLabel: "Submit",
                          destructive: false,
                          requireNote: false,
                        })
                      }
                    >
                      <Send className="size-4" />
                      Submit for approval
                    </Button>
                  ) : null}
                  {showApprove ? (
                    <Button
                      onClick={() =>
                        setReview({
                          fn: approveContract,
                          title: "Approve contract",
                          description: "This activates the contract.",
                          confirmLabel: "Approve",
                          destructive: false,
                          requireNote: false,
                        })
                      }
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                  ) : null}
                  {showReject ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setReview({
                          fn: rejectContract,
                          title: "Reject contract",
                          description:
                            "This returns the contract to draft for changes.",
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
                  {showTerminate ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setReview({
                          fn: terminateContract,
                          title: "Terminate contract",
                          description:
                            "This marks the contract as terminated.",
                          confirmLabel: "Terminate",
                          destructive: true,
                          requireNote: true,
                        })
                      }
                    >
                      <X className="size-4" />
                      Terminate
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
          <CardTitle className="text-base">Activity</CardTitle>
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
                    {contractEventLabel(event.action)}
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
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {review?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
