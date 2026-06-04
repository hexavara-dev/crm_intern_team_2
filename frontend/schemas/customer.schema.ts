import { z } from "zod";

export const customerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  organizationId: z.string().optional(),
  gender: z.string().optional(),
  salutation: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
