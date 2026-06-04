import api from "@/lib/api";
import { NoteFormData } from "@/schemas/note.schema";
import { Note } from "@/types/notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotes() {
  const queryClient = useQueryClient();

  const notesQuery = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await api.get("/api/note");
      return response.data;
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const response = await api.post<Note>("/api/note", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities"] });
      queryClient.invalidateQueries({ queryKey: ["dealActivities"] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<NoteFormData>;
    }) => {
      const response = await api.put<Note>(`/api/note/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities"] });
      queryClient.invalidateQueries({ queryKey: ["dealActivities"] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/note/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities"] });
      queryClient.invalidateQueries({ queryKey: ["dealActivities"] });
    },
  });

  return {
    notes: notesQuery.data,
    isLoading: notesQuery.isLoading,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
  };
}
