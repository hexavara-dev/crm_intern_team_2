import api from "@/lib/api";
import { LeadActivity } from "@/types/activity";
import { useAuth } from "@/components/auth/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useActivities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenantId;

  const leadActivitiesQuery = useQuery({
    queryKey: ["leadActivities"],
    queryFn: async () => {
      const response = await api.get<LeadActivity[]>("/api/leadactivity");
      return response.data;
    },
  });

  const createLeadActivityMutation = useMutation({
    mutationFn: async (data: {
      leadId?: string;
      dealId?: string;
      activityType: string;
      callLogs?: { create: Record<string, unknown> };
      tasks?: { create: Record<string, unknown> };
      notes?: { create: Record<string, unknown> };
    }) => {
      if (!tenantId) throw new Error("Not authenticated");
      const payload: Record<string, unknown> = {
        ...data,
        tenant: { connect: { id: tenantId } },
      };

      const isDealActivity = !!data.dealId;
      const endpoint = isDealActivity
        ? "/api/dealactivity"
        : "/api/leadactivity";

      if (data.leadId) {
        payload.lead = { connect: { id: data.leadId } };
        delete payload.leadId;
      }

      if (data.dealId) {
        payload.deal = { connect: { id: data.dealId } };
        delete payload.dealId;
      }

      const response = await api.post<LeadActivity>(endpoint, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leadActivities"] });

      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
      }

      if (variables.dealId) {
        queryClient.invalidateQueries({ queryKey: ["deal", variables.dealId] });
      }

      const type =
        variables.activityType === "call"
          ? "Call log"
          : variables.activityType === "task"
            ? "Task"
            : variables.activityType === "note"
              ? "Note"
              : "Activity";
      toast.success(`${type} added successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add activity");
    },
  });

  return {
    leadActivities: leadActivitiesQuery.data ?? [],
    isLoading: leadActivitiesQuery.isLoading,
    createLeadActivity: createLeadActivityMutation.mutateAsync,
    isCreatingActivity: createLeadActivityMutation.isPending,
  };
}
