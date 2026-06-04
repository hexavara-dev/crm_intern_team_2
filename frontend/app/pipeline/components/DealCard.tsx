"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/helper";
import { Deal } from "@/types/deal";

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function DealCard({ deal, onClick, onDelete }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { type: "deal", deal } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors group relative ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate pr-8">
            {deal.lead
              ? `${deal.lead.customer.firstName} ${deal.lead.customer.lastName || ""}`.trim()
              : "No Lead"}
          </p>
          {deal.dealType && (
            <p className="text-xs text-muted-foreground truncate">
              {deal.dealType}
            </p>
          )}
          <p className="text-sm font-semibold mt-1">
            {formatRupiah(deal.expectedAmount || 0)}
          </p>
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 hover:bg-accent rounded text-red-500"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
