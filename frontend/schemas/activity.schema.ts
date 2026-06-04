import { z } from "zod";

export const activityFormSchema = z.object({
  tenantId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  activityType: z.string().min(1, "Activity type is required"),
});

export type ActivityFormData = z.infer<typeof activityFormSchema>;
