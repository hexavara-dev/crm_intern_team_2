import { z } from "zod";

export const leadFormSchema = z.object({
  firstName: z.string().min(1, "Name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  statusId: z.string(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedUserId: z.string().optional(),
  gender: z.string().optional(),
  salutation: z.string().optional(),
  organizationName: z.string().optional(),
  organizationLocation: z.string().optional(),
  location: z.string().optional(),
  locationId: z.string().optional(),
  sourceUserId: z.string().optional(),
  sourceId: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
