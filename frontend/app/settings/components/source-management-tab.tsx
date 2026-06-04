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
import { useSources } from "@/hooks/use-sources";
import { Source } from "@/types/source";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type SourceType = "lead" | "viewing";

const sourceSchema = z.object({
  name: z.string().min(1, "Source name is required"),
  type: z.enum(["lead", "viewing"]),
});

type SourceFormData = z.infer<typeof sourceSchema>;

interface SourceManagementTabProps {
  type: SourceType;
  title: string;
  addButtonLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  placeholder?: string;
}

export function SourceManagementTab({
  type,
  title,
  addButtonLabel,
  dialogTitle,
  dialogDescription,
  placeholder,
}: SourceManagementTabProps) {
  const {
    sources,
    isLoading,
    createSource,
    deleteSource,
    isCreating,
    isDeleting,
  } = useSources({ additionalParams: { type } });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const form = useForm<SourceFormData>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      type,
    },
  });

  const columns = useMemo<ColumnDef<Source>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Source Name",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const source = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedSource(source);
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

  const onSubmit = async (data: SourceFormData) => {
    try {
      await createSource({
        name: data.name,
        type,
      });
      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create source:", error);
    }
  };

  const onConfirmDelete = async () => {
    if (!selectedSource) return;
    try {
      await deleteSource(selectedSource.id);
      setIsDeleteDialogOpen(false);
      setSelectedSource(null);
    } catch (error) {
      console.error("Failed to delete source:", error);
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
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Source Name"
                  placeholder={placeholder}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Source"}
                  </Button>
                </DialogFooter>
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
            <DataTable columns={columns} data={sources} searchKey="name" />
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onConfirmDelete}
        title="Delete Source"
        description="Are you sure you want to delete this source? This may affect related lead or viewing data."
        loading={isDeleting}
      />
    </div>
  );
}
