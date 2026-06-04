"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import FormSelect from "@/components/ui/form-select";
import { useDeals } from "@/hooks/use-deals";
import { useStages } from "@/hooks/use-stages";
import { Stage } from "@/types/stage";
import { useUsers } from "@/hooks/use-users";
import { formatRupiah } from "@/lib/helper";
import { Deal } from "@/types/deal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useSidebar } from "@/components/ui/sidebar";

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  isTerminal: z.boolean().optional(),
  color: z.string().optional(),
});

type StageFormData = z.infer<typeof stageSchema>;

const addDealToStageSchema = z.object({
  dealId: z.string().min(1, "Please select a deal"),
  assignedUserId: z.string().optional(),
});

type AddDealToStageData = z.infer<typeof addDealToStageSchema>;

function DealBoardCard({
  deal,
  onOpen,
  onDelete,
}: {
  deal: Deal;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`group relative cursor-pointer rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onOpen}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate pr-8 text-sm font-medium">
            {deal.lead
              ? `${deal.lead.customer.firstName} ${deal.lead.customer.lastName || ""}`.trim()
              : `Deal ${deal.refCode || deal.id.slice(0, 8)}`}
          </p>
          {deal.dealType && (
            <p className="truncate text-xs text-muted-foreground">
              {deal.dealType}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold">
            {formatRupiah(deal.expectedAmount || 0)}
          </p>
        </div>
      </div>

      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="rounded p-1 text-red-500 hover:bg-accent"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function DealStageLane({
  stage,
  deals,
  onAddDeal,
  onEditStage,
  onDeleteStage,
  onOpenDeal,
  onDeleteDeal,
}: {
  stage: Stage;
  deals: Deal[];
  onAddDeal: (stage: Stage) => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
  onOpenDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage", stage },
  });

  return (
    <div ref={setNodeRef} className="flex w-75 min-w-75 flex-col">
      <div className="flex items-center justify-between rounded-t-lg bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{stage.name}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {deals.length}
          </span>
          <span
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: stage.color }}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onAddDeal(stage);
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="rounded p-1 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onEditStage(stage);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-red-500 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStage(stage);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-55 flex-1 space-y-2 rounded-b-lg p-2 transition-colors ${
          isOver ? "bg-primary/10" : "bg-muted/20"
        }`}
      >
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealBoardCard
              key={deal.id}
              deal={deal}
              onOpen={() => onOpenDeal(deal)}
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

export function DealsPipelineTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { setOpen, setOpenMobile } = useSidebar();
  const { deals, updateDeal, deleteDeal } = useDeals({ getAll: true });
  const { users } = useUsers();
  const {
    stages,
    createStage,
    updateStage,
    deleteStage,
    isUpdating,
    isDeleting,
    isCreating,
    isLoading: isStagesLoading,
  } = useStages("deal");

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isDeleteStageOpen, setIsDeleteStageOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);

  const defaultStagesInitialized = useRef(false);
  const hasAutoClosedRef = useRef(false);

  useEffect(() => {
    if (hasAutoClosedRef.current) return;
    hasAutoClosedRef.current = true;
    setOpen(false);
    setOpenMobile(false);
  }, [setOpen, setOpenMobile]);

  useEffect(() => {
    if (
      !isStagesLoading &&
      stages.length === 0 &&
      !defaultStagesInitialized.current
    ) {
      defaultStagesInitialized.current = true;
      const defaultStages = [
        "Appointment Scheduled",
        "Qualified to Buy",
        "Presentation Scheduled",
        "Decision Maker Bought In",
        "Contract Sent",
      ];

      const createDefaultStages = async () => {
        for (let i = 0; i < defaultStages.length; i++) {
          await createStage({
            name: defaultStages[i],
            position: i,
            color: "#f3f4f6",
          });
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      };

      createDefaultStages();
    }
  }, [isStagesLoading, stages.length, createStage]);

  const stageForm = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      isTerminal: false,
    },
  });

  const addDealForm = useForm<AddDealToStageData>({
    resolver: zodResolver(addDealToStageSchema),
    defaultValues: {
      dealId: "",
      assignedUserId: "",
    },
  });

  const selectedDealId = addDealForm.watch("dealId");

  useEffect(() => {
    if (selectedDealId) {
      const deal = deals.find((d) => d.id === selectedDealId);
      if (deal) {
        addDealForm.setValue("assignedUserId", deal.assignedUserId || "");
      }
    }
  }, [selectedDealId, deals, addDealForm]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.position - b.position),
    [stages],
  );

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    sortedStages.forEach((stage) => {
      grouped[stage.id] = deals.filter((deal) => deal.stageId === stage.id);
    });
    return grouped;
  }, [sortedStages, deals]);

  const dealOptions = useMemo(() => {
    return deals.map((deal) => ({
      label: `${
        deal.lead
          ? `${deal.lead.customer.firstName} ${deal.lead.customer.lastName || ""}`.trim()
          : `Deal ${deal.refCode || deal.id.slice(0, 8)}`
      } ${deal.stage ? `(${deal.stage.name})` : "(Unassigned)"}`,
      value: deal.id,
    }));
  }, [deals]);

  const userOptions = useMemo(() => {
    return users?.map((u) => ({
      label: u.name || u.email,
      value: u.id,
    }));
  }, [users]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "deal") {
      setActiveDeal(event.active.data.current.deal as Deal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== "deal") return;

    const dealId = active.id as string;
    let destinationStageId: string | undefined;

    if (overType === "stage") {
      destinationStageId = over.id as string;
    }

    if (overType === "deal") {
      const targetDeal = over.data.current?.deal as Deal | undefined;
      destinationStageId = targetDeal?.stageId || undefined;
    }

    if (!destinationStageId) return;

    try {
      await updateDeal({
        id: dealId,
        data: { stageId: destinationStageId },
      });
    } catch (error) {
      console.error("Failed to move deal:", error);
    }
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    stageForm.reset({
      name: stage.name,
      isTerminal: stage.isTerminal,
    });
    setIsAddStageOpen(true);
  };

  const handleDeleteStage = (stage: Stage) => {
    setStageToDelete(stage);
    setIsDeleteStageOpen(true);
  };

  const onConfirmDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      await deleteStage(stageToDelete.id);
      setIsDeleteStageOpen(false);
      setStageToDelete(null);
    } catch (error) {
      console.error("Failed to delete stage:", error);
    }
  };

  const onSubmitStage = async (data: StageFormData) => {
    try {
      if (editingStage) {
        await updateStage({
          id: editingStage.id,
          data,
        });
      } else {
        await createStage({
          ...data,
          tenantId: user?.tenantId,
          position: sortedStages.length,
          color: data.color || "#f3f4f6",
        });
      }

      stageForm.reset();
      setEditingStage(null);
      setIsAddStageOpen(false);
    } catch (error) {
      console.error("Failed to save stage:", error);
    }
  };

  const handleAddDeal = (stage: Stage) => {
    setSelectedStage(stage);
    addDealForm.reset({
      dealId: "",
      assignedUserId: "",
    });
    setIsAddDealOpen(true);
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDeal(dealId);
      } catch (error) {
        console.error("Failed to delete deal:", error);
      }
    }
  };

  const onSubmitAddDeal = async (data: AddDealToStageData) => {
    try {
      await updateDeal({
        id: data.dealId,
        data: {
          stageId: selectedStage?.id,
          assignedUserId: data.assignedUserId || undefined,
        },
      });

      addDealForm.reset();
      setIsAddDealOpen(false);
      setSelectedStage(null);
    } catch (error) {
      console.error("Failed to add deal to stage:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Drag cards between stages to update deal pipeline.
        </h2>
        <Button onClick={() => setIsAddStageOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      <Dialog
        open={isAddStageOpen}
        onOpenChange={(open) => {
          setIsAddStageOpen(open);
          if (!open) {
            setEditingStage(null);
            stageForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStage ? "Edit Stage" : "Add New Stage"}
            </DialogTitle>
            <DialogDescription>
              {editingStage
                ? "Update the stage details."
                : "Create a new pipeline stage."}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...stageForm}>
            <form
              onSubmit={stageForm.handleSubmit(onSubmitStage)}
              className="space-y-4"
            >
              <FormInput
                name="name"
                label="Stage Name"
                placeholder="e.g. Appointment Scheduled"
              />

              <FormInput
                name="color"
                type="color"
                label="Color"
                className="max-w-40"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deal-isTerminal"
                  {...stageForm.register("isTerminal")}
                  className="h-4 w-4"
                />
                <label htmlFor="deal-isTerminal" className="text-sm">
                  Is Terminal (Won/Lost)
                </label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddStageOpen(false);
                    setEditingStage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isCreating
                    ? "Creating..."
                    : isUpdating
                      ? "Updating..."
                      : editingStage
                        ? "Update"
                        : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Deal to {selectedStage?.name}</DialogTitle>
            <DialogDescription>
              Select an existing deal to add to this pipeline stage.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...addDealForm}>
            <form
              onSubmit={addDealForm.handleSubmit(onSubmitAddDeal)}
              className="space-y-4"
            >
              <FormSelect
                name="dealId"
                label="Select Deal"
                placeholder="Select a deal..."
                options={dealOptions}
              />
              <FormSelect
                name="assignedUserId"
                label="Assignee"
                placeholder="Select a user..."
                options={userOptions}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDealOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Deal</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isDeleteStageOpen}
        onClose={() => {
          setIsDeleteStageOpen(false);
          setStageToDelete(null);
        }}
        loading={isDeleting}
        onConfirm={onConfirmDeleteStage}
        title="Delete Stage"
        description={`Are you sure you want to delete stage \"${stageToDelete?.name || "this stage"}\"?`}
      />

      <div className="overflow-x-auto pb-2">
        {isStagesLoading ? (
          <div className="flex h-56 items-center justify-center rounded-lg border bg-card text-muted-foreground">
            Loading pipeline...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4">
              <SortableContext items={sortedStages.map((stage) => stage.id)}>
                {sortedStages.map((stage) => (
                  <DealStageLane
                    key={stage.id}
                    stage={stage}
                    deals={dealsByStage[stage.id] || []}
                    onAddDeal={handleAddDeal}
                    onEditStage={handleEditStage}
                    onDeleteStage={handleDeleteStage}
                    onOpenDeal={(deal) => router.push(`/deals/${deal.id}`)}
                    onDeleteDeal={handleDeleteDeal}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeDeal && (
                <div className="rounded-lg border bg-card p-3 opacity-80 shadow-lg">
                  <p className="text-sm font-medium">
                    {activeDeal.lead
                      ? `${activeDeal.lead.customer.firstName} ${activeDeal.lead.customer.lastName || ""}`.trim()
                      : `Deal ${activeDeal.refCode || activeDeal.id.slice(0, 8)}`}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatRupiah(activeDeal.expectedAmount || 0)}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
