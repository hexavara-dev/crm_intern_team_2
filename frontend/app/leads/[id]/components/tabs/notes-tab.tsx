"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FormTextarea } from "@/components/ui/form-textarea";
import type { Note } from "@/lib/data";
import { formatDateTime } from "@/lib/helper";
import { FileText, Plus, User } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type NoteFormData = {
  content: string;
};

interface NotesTabProps {
  notes: Note[];
  onAddNote: (data: NoteFormData) => void;
  entityLabel?: string;
}

export function NotesTab({
  notes,
  onAddNote,
  entityLabel = "lead",
}: NotesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<NoteFormData>({
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: NoteFormData) => {
    onAddNote(data);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Sales Notes</h2>
          <p className="text-sm text-muted-foreground">
            Internal notes for internal use.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="size-3.5 mr-1.5" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a note for this {entityLabel}.
              </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid gap-4 py-4"
              >
                <FormTextarea
                  name="content"
                  label="Note"
                  validation={{
                    required: "Note content is required",
                  }}
                  placeholder="Enter your note..."
                  rows={5}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Note</Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No notes yet</EmptyTitle>
            <EmptyDescription>
              Keep track of important details and context about this{" "}
              {entityLabel}.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Add first note
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {notes
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((note) => (
              <Card
                key={note.id}
                className="shadow-none border hover:bg-muted/10 transition-colors"
              >
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
