import { z } from "zod";

export const noteFormSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  leadActivityId: z.string().uuid().optional(),
  dealActivityId: z.string().uuid().optional(),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
