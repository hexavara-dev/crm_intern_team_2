"use client";

import Typography from "@/components/Typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/helper";
import { Viewing } from "@/types/viewing";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type ViewingsTableProps = {
  viewings: Viewing[];
  isLoading: boolean;
  onEdit: (viewing: Viewing) => void;
  onDelete: (viewing: Viewing) => void;
};

export function ViewingsTable({
  viewings,
  isLoading,
  onEdit,
  onDelete,
}: ViewingsTableProps) {
  const columns = useMemo<ColumnDef<Viewing>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Lead",
        cell: ({ row }) => (
          <Link
            className="font-medium text-blue-400 hover:underline cursor-pointer"
            href={`/leads/${row.original.leadId}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        header: "PIC Visit",
        cell: ({ row }) => <Typography>{row.original.actor?.name}</Typography>,
      },
      {
        accessorKey: "scheduledAt",
        header: "Visit Date",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatDate(new Date(row.original.scheduledAt))}
          </div>
        ),
      },
      {
        accessorKey: "status.name",
        header: "Status",
        cell: ({ row }) => (
          <Badge colorHex={row.original.status?.color}>
            {row.original.status?.name}
          </Badge>
        ),
      },
      {
        accessorKey: "source.name",
        header: "Source",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const viewing = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(viewing)}
                title="Edit Visit"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(viewing)}
                title="Delete Visit"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onDelete, onEdit],
  );

  return <DataTable columns={columns} data={viewings} isLoading={isLoading} />;
}
