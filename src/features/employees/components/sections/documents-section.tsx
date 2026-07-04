"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Download,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate, formatFileSize } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ActionMenu } from "@/components/shared/action-menu";
import {
  addEmployeeDocumentAction,
  deleteEmployeeSection,
  getDocumentDownloadUrlAction,
  updateDocument,
} from "../../actions/employee-sections.actions";
import {
  documentMetaSchema,
  type DocumentMetaInput,
} from "../../schemas/sections.schema";
import { DOCUMENT_CATEGORIES, DOCUMENT_TYPES } from "../../constants";
import type { EmployeeDocument } from "../../types";
import { SectionCard } from "../section-card";

const NONE = "__none__";

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 30) return <Badge variant="warning">Expiring</Badge>;
  return null;
}

export function DocumentsSection({
  employeeId,
  documents,
  canManage,
}: {
  employeeId: string;
  documents: EmployeeDocument[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeDocument | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  async function onDownload(doc: EmployeeDocument) {
    setDownloadingId(doc.id);
    const result = await getDocumentDownloadUrlAction(doc.id);
    setDownloadingId(null);
    if (!result.success) return toast.error(result.error);
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  async function onDelete(id: string) {
    const result = await deleteEmployeeSection({
      section: "employee_documents",
      id,
    });
    if (!result.success) return toast.error(result.error);
    toast.success("Document removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Documents & attachments"
      description="Passports, visas, contracts, and other files."
      action={
        canManage ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        ) : null
      }
    >
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload documents and attachments here."
          className="border-0"
        />
      ) : (
        <ul className="divide-y">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{doc.title}</p>
                    <ExpiryBadge date={doc.expiry_date} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[
                      doc.document_type,
                      doc.number,
                      doc.expiry_date
                        ? `Expires ${formatDate(doc.expiry_date)}`
                        : null,
                      doc.file_size ? formatFileSize(doc.file_size) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {doc.file_url && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Download"
                    disabled={downloadingId === doc.id}
                    onClick={() => onDownload(doc)}
                  >
                    {downloadingId === doc.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                  </Button>
                )}
                {canManage && (
                  <ActionMenu
                    groups={[
                      [
                        {
                          label: "Edit",
                          icon: Pencil,
                          onSelect: () => {
                            setEditing(doc);
                            setOpen(true);
                          },
                        },
                      ],
                      [
                        {
                          label: "Delete",
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => void onDelete(doc.id),
                        },
                      ],
                    ]}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <DocumentDialog
          key={editing?.id ?? "new"}
          open={open}
          onOpenChange={setOpen}
          employeeId={employeeId}
          document={editing}
        />
      )}
    </SectionCard>
  );
}

function DocumentDialog({
  open,
  onOpenChange,
  employeeId,
  document,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  document: EmployeeDocument | null;
}) {
  const router = useRouter();
  const isEdit = !!document;
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DocumentMetaInput>({
    resolver: zodResolver(documentMetaSchema),
    defaultValues: {
      employee_id: employeeId,
      title: document?.title ?? "",
      category: (document?.category ??
        "document") as DocumentMetaInput["category"],
      document_type: document?.document_type ?? "",
      number: document?.number ?? "",
      issue_date: document?.issue_date ?? "",
      expiry_date: document?.expiry_date ?? "",
    },
  });

  async function onSubmit(values: DocumentMetaInput) {
    if (isEdit) {
      const result = await updateDocument({ id: document!.id, ...values });
      if (!result.success) return toast.error(result.error);
      toast.success("Document updated.");
    } else {
      const fd = new FormData();
      fd.set("employee_id", values.employee_id);
      fd.set("title", values.title);
      fd.set("category", values.category);
      if (values.document_type) fd.set("document_type", values.document_type);
      if (values.number) fd.set("number", values.number);
      if (values.issue_date) fd.set("issue_date", values.issue_date);
      if (values.expiry_date) fd.set("expiry_date", values.expiry_date);
      const file = fileRef.current?.files?.[0];
      if (file) fd.set("file", file);
      const result = await addEmployeeDocumentAction(fd);
      if (!result.success) return toast.error(result.error);
      toast.success("Document added.");
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit document" : "Add document"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="document-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Passport" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.value ? field.value : NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!isEdit && (
              <div className="space-y-1.5">
                <FormLabel htmlFor="doc-file">File (optional)</FormLabel>
                <Input id="doc-file" ref={fileRef} type="file" />
                <p className="text-xs text-muted-foreground">Max 10 MB.</p>
              </div>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="document-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
