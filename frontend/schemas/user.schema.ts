import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
