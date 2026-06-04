import { z } from "zod";

export const viewingFormSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  actorId: z.string().optional(),
  statusId: z.string().optional(),
  sourceId: z.string().optional(),
  locationId: z.string().optional(),
  scheduledAt: z.string().min(1, "Visit date is required"),
  notes: z.string().optional(),
});

export type ViewingFormData = z.infer<typeof viewingFormSchema>;
