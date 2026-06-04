"use client";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Stage } from "@/types/stage";
import { Deal } from "@/types/deal";
import { DealCard } from "./DealCard";

interface StageColumnProps {
  stage: Stage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onAddDeal: (stage: Stage) => void;
}

export function StageColumn({
  stage,
  deals,
  onDealClick,
  onDeleteDeal,
  onEditStage,
  onDeleteStage,
  onAddDeal,
}: StageColumnProps) {
  const { setNodeRef } = useSortable({
    id: stage.id,
    data: { type: "stage", stage },
  });

  return (
    <div ref={setNodeRef} className="flex flex-col min-w-[280px] w-[280px]">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{stage.name}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1 hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              onAddDeal(stage);
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              onEditStage(stage);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-accent rounded text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStage(stage.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-muted/20 p-2 rounded-b-lg space-y-2 min-h-[200px]">
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
              onDelete={(e) => {
                e.stopPropagation();
                onDeleteDeal(deal.id);
              }}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
