"use client";

import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
import type { DocumentListItem } from "../queries/documents.queries";

interface Props {
  documents: DocumentListItem[];
  categories: string[];
}

function expiryBadge(expiry: string | null) {
  if (!expiry) return null;
  const today = new Date();
  const exp = new Date(expiry + "T00:00:00");
  const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return <Badge variant="destructive">Expired</Badge>;
  if (diff <= 30) return <Badge variant="warning">Expiring soon</Badge>;
  return null;
}

export function DocumentsWorkspace({ documents, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.employeeName.toLowerCase().includes(q) ||
      (d.documentNumber?.toLowerCase().includes(q) ?? false);
    const matchesCat = categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  async function handleDownload(doc: DocumentListItem) {
    if (!doc.fileUrl) return;
    window.open(doc.fileUrl, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, employee, or document number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={search || categoryFilter !== "all" ? "Try adjusting your filters." : "No documents have been uploaded yet."}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.category && (
                        <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{doc.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{doc.employeeNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{doc.documentType.replace(/_/g, " ")}</TableCell>
                  <TableCell>{doc.documentNumber ?? "—"}</TableCell>
                  <TableCell>
                    {doc.expiryDate ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {format(new Date(doc.expiryDate + "T00:00:00"), "dd MMM yyyy")}
                        </span>
                        {expiryBadge(doc.expiryDate)}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(doc.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {doc.fileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
