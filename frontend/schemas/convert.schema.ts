import { z } from "zod";

export const convertDealSchema = z.object({
  expectedAmount: z
    .number()
    .min(0, "Amount must be a positive number")
    .optional()
    .or(z.number().min(0, "Amount must be a positive number")),
});

export type ConvertDealFormData = z.infer<typeof convertDealSchema>;
