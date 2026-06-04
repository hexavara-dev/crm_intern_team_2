import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { InviteFormData } from "@/schemas/invite.schema";

export interface Invite {
  id: string;
  tenantId: string;
  hostUserId: string;
  email: string;
  name?: string;
  role: string;
  acceptedAt?: string;
  invitedAt: string;
  expiresAt: string;
}

export function useInvites() {
  const queryClient = useQueryClient();

  const invitesQuery = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const response = await api.get<Invite[]>("/api/invite");
      return response.data;
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const response = await api.post<Invite>("/api/invite", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      toast.success("Invitation sent successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to send invitation");
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/invite/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      toast.success("Invitation deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to delete invitation");
    },
  });

  return {
    invites: invitesQuery.data ?? [],
    isLoading: invitesQuery.isLoading,
    createInvite: createInviteMutation.mutateAsync,
    deleteInvite: deleteInviteMutation.mutateAsync,
    isCreating: createInviteMutation.isPending,
    isDeleting: deleteInviteMutation.isPending,
  };
}
