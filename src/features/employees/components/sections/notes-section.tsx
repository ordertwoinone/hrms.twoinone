"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatRelative, getInitials } from "@/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import {
  addNote,
  deleteEmployeeSection,
} from "../../actions/employee-sections.actions";
import type { EmployeeNoteItem } from "../../types";
import { SectionCard } from "../section-card";

export function NotesSection({
  employeeId,
  notes,
  canManage,
}: {
  employeeId: string;
  notes: EmployeeNoteItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function onAdd() {
    if (!body.trim()) return;
    setPending(true);
    const result = await addNote({ employee_id: employeeId, body });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setBody("");
    toast.success("Note added.");
    router.refresh();
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    const result = await deleteEmployeeSection({
      section: "employee_notes",
      id,
    });
    setDeletingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Note removed.");
    router.refresh();
  }

  return (
    <SectionCard
      title="Notes"
      description="Internal notes about this employee."
    >
      {canManage && (
        <div className="mb-4 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Add a note…"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onAdd}
              disabled={pending || !body.trim()}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Add note"
              )}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Notes added here stay internal."
          className="border-0"
        />
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(note.authorName ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {note.authorName ?? "Unknown"}
                  </p>
                  <div className="flex items-center gap-2">
                    <time className="text-xs text-subtle-foreground">
                      {formatRelative(note.created_at)}
                    </time>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => onDelete(note.id)}
                        disabled={deletingId === note.id}
                        aria-label="Delete note"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {deletingId === note.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {note.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
