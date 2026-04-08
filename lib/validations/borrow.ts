import { z } from "zod";

// Borrow Request Validation
export const borrowRequestSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  unitId: z.string().uuid("Invalid unit ID"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  purpose: z.string().min(1, "Purpose is required").max(500),
  status: z.enum(["pending", "accepted", "rejected", "returned"]).default("pending"),
  adminNotes: z.string().max(500).optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const borrowRequestUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "returned"]).optional(),
  adminNotes: z.string().max(500).optional(),
});

// Types
export type BorrowRequestInput = z.infer<typeof borrowRequestSchema>;
export type BorrowRequestUpdateInput = z.infer<typeof borrowRequestUpdateSchema>;
