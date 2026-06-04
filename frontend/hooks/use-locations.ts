import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
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

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  metadata?: unknown;
  createdAt: string;
}

export interface CreateLocationData {
  name: string;
  description?: string;
  metadata?: unknown;
}

export function useLocations() {
  const queryClient = useQueryClient();

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await api.get("/api/location");
      return response.data;
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: CreateLocationData) => {
      const response = await api.post<Location>("/api/location", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create location");
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateLocationData>;
    }) => {
      const response = await api.put<Location>(`/api/location/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to update location");
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/location/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to delete location");
    },
  });

  return {
    locations: normalizeCollection<Location>(locationsQuery.data),
    isLoading: locationsQuery.isLoading,
    createLocation: createLocationMutation.mutateAsync,
    updateLocation: updateLocationMutation.mutateAsync,
    deleteLocation: deleteLocationMutation.mutateAsync,
    isCreating: createLocationMutation.isPending,
    isUpdating: updateLocationMutation.isPending,
    isDeleting: deleteLocationMutation.isPending,
  };
}
