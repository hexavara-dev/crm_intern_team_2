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
import { Location, useLocations } from "@/hooks/use-locations";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export function LocationManagementTab() {
  const {
    locations,
    isLoading,
    createLocation,
    deleteLocation,
    isCreating,
    isDeleting,
  } = useLocations();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const columns = useMemo<ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Location Name",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.getValue("description") || "-",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const location = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedLocation(location);
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

  const onSubmit = async (data: LocationFormData) => {
    try {
      await createLocation({
        name: data.name,
        description: data.description,
      });
      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const onConfirmDelete = async () => {
    if (!selectedLocation) return;
    try {
      await deleteLocation(selectedLocation.id);
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  return (
    <div className="mt-0 space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => form.reset()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Units
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Location</DialogTitle>
              <DialogDescription>
                Create a master units used by leads and visit.
              </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Location Name"
                  placeholder="e.g. Jakarta Warehouse"
                />
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="Optional location details"
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
                    {isCreating ? "Creating..." : "Create Location"}
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={locations} searchKey="name" />
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onConfirmDelete}
        title="Delete Location"
        description="Are you sure you want to delete this location? This may affect linked leads or inventory records."
        loading={isDeleting}
      />
    </div>
  );
}
