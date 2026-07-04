"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FilePlus2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { getMyLetterUrl, requestHrLetter } from "../actions/self-service.actions";
import {
  requestLetterSchema,
  type RequestLetterInput,
} from "../schemas/self-service.schema";
import { LETTER_STATUSES, LETTER_TYPES } from "../constants";
import type { EssLetter } from "../types";

const EMPTY: RequestLetterInput = {
  letter_type: "Salary Certificate",
  addressed_to: "",
  purpose: "",
};

export function EssLetters({ letters }: { letters: EssLetter[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const form = useForm<RequestLetterInput>({
    resolver: zodResolver(requestLetterSchema),
    defaultValues: EMPTY,
  });

  async function onSubmit(values: RequestLetterInput) {
    const result = await requestHrLetter(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Letter request submitted.");
    form.reset(EMPTY);
    setOpen(false);
    router.refresh();
  }

  async function onDownload(id: string) {
    setPendingId(id);
    const result = await getMyLetterUrl(id);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          HR letter requests
        </h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <FilePlus2 className="size-4" />
          Request letter
        </Button>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Letter</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {letters.length ? (
                letters.map((l) => {
                  const meta = LETTER_STATUSES[l.status];
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{l.letterType}</p>
                        {l.addressedTo ? (
                          <p className="text-xs text-muted-foreground">
                            To: {l.addressedTo}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(l.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === "ready" && l.hasAttachment ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Download letter"
                            disabled={pendingId === l.id}
                            onClick={() => onDownload(l.id)}
                          >
                            <Download className="size-4" />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="h-32">
                    <EmptyState
                      icon={Mail}
                      title="No letter requests"
                      description="Request a salary certificate, NOC, and more."
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request an HR letter</DialogTitle>
            <DialogDescription>
              HR will process your request and attach the signed letter.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id="letter-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="letter_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Letter type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LETTER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
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
                name="addressed_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Addressed to (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Emirates NBD"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="letter-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
