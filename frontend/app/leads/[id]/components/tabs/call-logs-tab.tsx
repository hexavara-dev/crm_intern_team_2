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
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import type { CallLog } from "@/lib/data";
import { formatDateTime, formatDuration } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Clock, Phone, Plus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type CallLogFormData = {
  duration: number;
  notes: string;
};

interface CallLogsTabProps {
  callLogs: CallLog[];
  onAddCallLog: (data: CallLogFormData) => void;
  entityLabel?: string;
}

export function CallLogsTab({
  callLogs,
  onAddCallLog,
  entityLabel = "lead",
}: CallLogsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CallLogFormData>({
    defaultValues: {
      duration: 0,
      notes: "",
    },
  });

  const handleSubmit = (data: CallLogFormData) => {
    onAddCallLog(data);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Call Logs</h2>
          <p className="text-sm text-muted-foreground">
            History of all calls with this {entityLabel}.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="size-3.5 mr-1.5" />
              Log Call
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Call</DialogTitle>
              <DialogDescription>
                Record a new call with this {entityLabel}.
              </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="duration"
                    label="Duration (seconds)"
                    type="number"
                    placeholder="0"
                  />
                  <div className="col-span-2">
                    <FormTextarea
                      name="notes"
                      label="Notes"
                      placeholder="Call details..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Call</Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>

      {callLogs.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Phone className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No call logs yet</EmptyTitle>
            <EmptyDescription>
              Keep track of all phone interactions with this {entityLabel} here.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Log your first call
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {callLogs
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((log) => {
              return (
                <Card
                  key={log.id}
                  className="overflow-hidden border shadow-none hover:bg-muted/30 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "size-9 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600",
                        )}
                      >
                        <Phone className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm capitalize">
                              Call Record
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        {log.duration && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <Clock className="size-3" />
                            {formatDuration(log.duration)}
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-sm text-foreground/80 leading-normal">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
