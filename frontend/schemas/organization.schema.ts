import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  location: z.string().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
