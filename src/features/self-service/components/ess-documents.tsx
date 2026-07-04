"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { getMyDocumentUrl } from "../actions/self-service.actions";
import type { EssDocument } from "../types";

export function EssDocuments({ documents }: { documents: EssDocument[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDownload(id: string) {
    setPendingId(id);
    const result = await getMyDocumentUrl(id);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card>
      <CardContent className="overflow-auto p-0">
        <Table className="[&_td]:py-3">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Document</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length ? (
              documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{d.title}</p>
                    {d.fileName ? (
                      <p className="text-xs text-muted-foreground">{d.fileName}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {d.category ? (
                      <Badge variant="outline">{d.category}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.expiryDate ? formatDate(d.expiryDate) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Download"
                      disabled={pendingId === d.id}
                      onClick={() => onDownload(d.id)}
                    >
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-32">
                  <EmptyState
                    icon={FileText}
                    title="No documents"
                    description="Documents shared by HR will appear here."
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
