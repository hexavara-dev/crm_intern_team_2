import { useAuth } from "@/components/auth/auth-provider";
import api from "@/lib/api";
import { Source } from "@/types/source";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function normalizeCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  const data = (payload as { data?: unknown } | undefined)?.data;
  if (Array.isArray(data)) return data as T[];

  const nestedData = (data as { data?: unknown } | undefined)?.data;
  if (Array.isArray(nestedData)) return nestedData as T[];

  const dataPerPage = (data as { data_per_page?: unknown } | undefined)
    ?.data_per_page;
  if (Array.isArray(dataPerPage)) return dataPerPage as T[];

  return [];
}

export interface CreateSourceData {
  name: string;
  type?: string;
}

type AdditionalParams = {
  additionalParams?: {
    [key: string]: string;
  };
};

export function useSources({ additionalParams }: AdditionalParams = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenantId;

  const sourcesQuery = useQuery({
    queryKey: ["sources", tenantId, additionalParams],
    queryFn: async () => {
      const response = await api.get<Source[]>("/api/source", {
        params: additionalParams,
      });
      return response.data;
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: async (data: CreateSourceData) => {
      const payload = {
        ...data,
        tenant: { connect: { id: tenantId } },
      };
      const response = await api.post<Source>("/api/source", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source created successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create source");
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/source/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to delete source");
    },
  });

  return {
    sources: normalizeCollection<Source>(sourcesQuery.data),
    isLoading: sourcesQuery.isLoading,
    createSource: createSourceMutation.mutateAsync,
    deleteSource: deleteSourceMutation.mutateAsync,
    isCreating: createSourceMutation.isPending,
    isDeleting: deleteSourceMutation.isPending,
  };
}
