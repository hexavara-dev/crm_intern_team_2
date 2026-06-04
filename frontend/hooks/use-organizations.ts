import api from "@/lib/api";
import { OrganizationFormData } from "@/schemas/organization.schema";
import { Organization } from "@/types/organization";
import { useAuth } from "@/components/auth/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/types/api";

export function useOrganizations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenantId;

  const organizationsQuery = useQuery<ApiResponse<Organization[]>>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.get("/api/organization");
      return response.data;
    },
  });

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      if (!tenantId) throw new Error("Not authenticated");
      const payload = {
        ...data,
        tenantId,
      };
      const response = await api.post<Organization>(
        "/api/organization",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization created successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create organization");
    },
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OrganizationFormData>;
    }) => {
      const response = await api.put<Organization>(
        `/api/organization/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to update organization");
    },
  });

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/organization/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization deleted successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to delete organization");
    },
  });

  return {
    organizations: organizationsQuery.data,
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    error: organizationsQuery.error,
    createOrganization: createOrganizationMutation.mutateAsync,
    updateOrganization: updateOrganizationMutation.mutateAsync,
    deleteOrganization: deleteOrganizationMutation.mutateAsync,
    isCreating: createOrganizationMutation.isPending,
    isUpdating: updateOrganizationMutation.isPending,
    isDeleting: deleteOrganizationMutation.isPending,
  };
}

export function useOrganizationDetail(id: string) {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const response = await api.get<Organization>(`/api/organization/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
