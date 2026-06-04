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
import {
  Box,
  Circle,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";

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
import { useLeads } from "@/hooks/use-leads";
import { useStages } from "@/hooks/use-stages";
import { Stage } from "@/types/stage";
import { Lead } from "@/types/lead";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useSidebar } from "@/components/ui/sidebar";

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  isTerminal: z.boolean().optional(),
  color: z.string(),
});

type StageFormData = z.infer<typeof stageSchema>;

const addLeadToStageSchema = z.object({
  leadId: z.string().min(1, "Please select a lead"),
});

type AddLeadToStageData = z.infer<typeof addLeadToStageSchema>;

function LeadBoardCard({
  lead,
  onOpen,
  onDelete,
}: {
  lead: Lead;
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
    id: lead.id,
    data: { type: "lead", lead },
  });

  const fullName =
    `${lead.customer.firstName} ${lead.customer.lastName || ""}`.trim();

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
          <p className="truncate pr-8 text-sm font-medium">{fullName}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <User className="size-4" />
            {lead.assignedUser?.name || "Unassigned"}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Box className="size-4" />
            {lead.location?.name}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Circle className="size-4" />
            {lead.viewing?.status?.name || "No viewing status"}
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

function LeadStageLane({
  stage,
  leads,
  onAddLead,
  onEditStage,
  onDeleteStage,
  onOpenLead,
  onDeleteLead,
}: {
  stage: Stage;
  leads: Lead[];
  onAddLead: (stage: Stage) => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
  onOpenLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage", stage },
  });

  return (
    <div className="flex w-75 min-w-75 flex-col">
      <div className="flex items-center justify-between rounded-t-lg bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{stage.name}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {leads.length}
          </span>
          <span
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: stage.color || "#f3f4f6" }}
          ></span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onAddLead(stage);
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
          items={leads.map((lead) => lead.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadBoardCard
              key={lead.id}
              lead={lead}
              onOpen={() => onOpenLead(lead)}
              onDelete={(e) => {
                e.stopPropagation();
                onDeleteLead(lead.id);
              }}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function LeadsPipelineTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { setOpen, setOpenMobile } = useSidebar();
  const { leads, setLeadStage, deleteLead } = useLeads();
  const {
    stages,
    createStage,
    isUpdating,
    isCreating,
    updateStage,
    deleteStage,
    isDeleting,
    isLoading: isStagesLoading,
  } = useStages("lead");

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
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
        "New Inquiry",
        "Contacted",
        "Qualified",
        "Negotiation",
        "Converted",
      ];

      const createDefaultStages = async () => {
        for (let i = 0; i < defaultStages.length; i++) {
          await createStage({
            name: defaultStages[i],
            position: i,
            color: "#f3f4f6",
            tenantId: user?.tenantId,
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

  const addLeadForm = useForm<AddLeadToStageData>({
    resolver: zodResolver(addLeadToStageSchema),
    defaultValues: {
      leadId: "",
    },
  });

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

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    sortedStages.forEach((stage) => {
      grouped[stage.id] = leads.filter((lead) => lead.stageId === stage.id);
    });
    return grouped;
  }, [sortedStages, leads]);

  const leadOptions = useMemo(() => {
    return leads.map((lead) => ({
      label:
        `${lead.customer.firstName} ${lead.customer.lastName || ""}`.trim(),
      value: lead.id,
    }));
  }, [leads]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "lead") {
      setActiveLead(event.active.data.current.lead as Lead);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== "lead") return;

    const leadId = active.id as string;

    let destinationStageName: string | undefined;

    if (overType === "stage") {
      destinationStageName = (over.data.current?.stage as Stage | undefined)
        ?.name;
    }

    if (overType === "lead") {
      const targetLead = over.data.current?.lead as Lead | undefined;
      const targetStage = sortedStages.find(
        (s) => s.id === targetLead?.stageId,
      );
      destinationStageName = targetStage?.name;
    }

    if (!destinationStageName) {
      return;
    }

    try {
      await setLeadStage({
        id: leadId,
        stageName: destinationStageName,
      });
    } catch (error) {
      console.error("Failed to move lead:", error);
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
        });
      }

      stageForm.reset();
      setEditingStage(null);
      setIsAddStageOpen(false);
    } catch (error) {
      console.error("Failed to save stage:", error);
    }
  };

  const handleAddLead = (stage: Stage) => {
    setSelectedStage(stage);
    addLeadForm.reset({ leadId: "" });
    setIsAddLeadOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(leadId);
      } catch (error) {
        console.error("Failed to delete lead:", error);
      }
    }
  };

  const onSubmitAddLead = async (data: AddLeadToStageData) => {
    if (!selectedStage?.name) return;

    try {
      await setLeadStage({
        id: data.leadId,
        stageName: selectedStage.name,
      });

      addLeadForm.reset();
      setIsAddLeadOpen(false);
      setSelectedStage(null);
    } catch (error) {
      console.error("Failed to add lead to stage:", error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-sm font-medium text-muted-foreground">
          Drag cards between stages to update lead pipeline.
        </h2>
        <Button onClick={() => setIsAddStageOpen(true)} className="w-max">
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
                placeholder="e.g. Qualified"
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
                  id="lead-isTerminal"
                  {...stageForm.register("isTerminal")}
                  className="h-4 w-4"
                />
                <label htmlFor="lead-isTerminal" className="text-sm">
                  Is Terminal
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

      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead to {selectedStage?.name}</DialogTitle>
            <DialogDescription>
              Select an existing lead to add to this pipeline stage.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...addLeadForm}>
            <form
              onSubmit={addLeadForm.handleSubmit(onSubmitAddLead)}
              className="space-y-4"
            >
              <FormSelect
                name="leadId"
                label="Select Lead"
                placeholder="Select a lead..."
                options={leadOptions}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddLeadOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Lead</Button>
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

      <div className="w-full min-w-0 overflow-x-auto pb-2">
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
            <div className="flex w-max min-w-full gap-4 pb-4 pr-2">
              <SortableContext items={sortedStages.map((stage) => stage.id)}>
                {sortedStages.map((stage) => (
                  <LeadStageLane
                    key={stage.id}
                    stage={stage}
                    leads={leadsByStage[stage.id] || []}
                    onAddLead={handleAddLead}
                    onEditStage={handleEditStage}
                    onDeleteStage={handleDeleteStage}
                    onOpenLead={(lead) => router.push(`/leads/${lead.id}`)}
                    onDeleteLead={handleDeleteLead}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeLead && (
                <div className="rounded-lg border bg-card p-3 opacity-80 shadow-lg">
                  <p className="text-sm font-medium">
                    {`${activeLead.customer.firstName} ${activeLead.customer.lastName || ""}`.trim()}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeLead.customer.organization?.name ||
                      "No organization"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {activeLead.assignedUser?.name || "Unassigned"}
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
