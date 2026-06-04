"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { Status, useStatuses } from "@/hooks/use-statuses";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type StatusType = "lead" | "deal" | "viewing";

const statusSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  priority: z.coerce.number().optional(),
  color: z.string().optional(),
  type: z.enum(["lead", "deal", "viewing"]),
});

type StatusFormData = z.infer<typeof statusSchema>;

interface StatusManagementTabProps {
  type: StatusType;
  title: string;
  addButtonLabel: string;
  dialogTitle: string;
  dialogDescription: string;
}

export function StatusManagementTab({
  type,
  title,
  addButtonLabel,
  dialogTitle,
  dialogDescription,
}: StatusManagementTabProps) {
  const {
    statuses,
    isLoading,
    createStatus,
    deleteStatus,
    isCreating,
    isDeleting,
  } = useStatuses({ additionalParams: { type } });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      name: "",
      priority: 0,
      color: "#3b82f6",
      type,
    },
  });

  const columns = useMemo<ColumnDef<Status>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Status Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span>{row.original.name}</span>
            {row.original.isSystemStatus ? (
              <span className="text-[10px] uppercase tracking-wide rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                System
              </span>
            ) : null}
            {row.original.isDefaultStatus ? (
              <span className="text-[10px] uppercase tracking-wide rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
                Default
              </span>
            ) : null}
            {row.original.isClosingStatus ? (
              <span className="text-[10px] uppercase tracking-wide rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">
                Closing
              </span>
            ) : null}
            {row.original.isFailedStatus ? (
              <span className="text-[10px] uppercase tracking-wide rounded bg-red-50 px-1.5 py-0.5 text-red-600">
                Failed
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => row.getValue("priority") || 0,
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => {
          const color = row.getValue("color") as string | null;
          return color ? (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{color}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const status = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedStatus(status);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const onSubmit = async (data: StatusFormData) => {
    try {
      await createStatus({
        name: data.name,
        priority: data.priority,
        color: data.color,
        type,
      });
      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create status:", error);
    }
  };

  const onConfirmDelete = async () => {
    if (!selectedStatus) return;
    try {
      await deleteStatus(selectedStatus.id);
      setIsDeleteDialogOpen(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error("Failed to delete status:", error);
    }
  };

  return (
    <div className="mt-0 space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => form.reset()}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-2 gap-4"
              >
                <FormInput
                  name="name"
                  label="Status Name"
                  placeholder="e.g. NEW, QUALIFIED"
                  className="col-span-2"
                />
                <FormInput
                  name="priority"
                  label="Priority"
                  type="number"
                  placeholder="0"
                />
                <FormInput
                  name="color"
                  label="Color"
                  type="color"
                  className="h-10"
                />
                <div className="col-span-2">
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Status"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={statuses} searchKey="name" />
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onConfirmDelete}
        title="Delete Status"
        description="Are you sure you want to delete this status? This may affect leads and deals using this status."
        loading={isDeleting}
      />
    </div>
  );
}
