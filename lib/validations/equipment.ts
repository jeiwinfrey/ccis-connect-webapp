import { z } from "zod";

// Equipment Category Validation
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  emoji: z.string().min(1, "Emoji is required").max(10),
  description: z.string().min(1, "Description is required").max(500),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format (use #RRGGBB)"),
});

export const categoryUpdateSchema = categorySchema.partial();

// Equipment Model Validation
export const modelSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  modelName: z.string().min(1, "Model name is required").max(200),
  description: z.string().min(1, "Description is required").max(500),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")),
});

export const modelUpdateSchema = modelSchema.partial().omit({ categoryId: true });

// Equipment Unit Validation
export const unitSchema = z.object({
  modelId: z.string().uuid("Invalid model ID"),
  unitId: z.string().min(1, "Unit ID is required").max(50),
  condition: z.enum(["Excellent", "Good", "Fair", "Maintenance"]),
  status: z.enum(["available", "on-loan", "maintenance"]),
  notes: z.string().max(500).default(""),
});

export const unitUpdateSchema = unitSchema.partial().omit({ modelId: true });

// Types
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ModelInput = z.infer<typeof modelSchema>;
export type ModelUpdateInput = z.infer<typeof modelUpdateSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type UnitUpdateInput = z.infer<typeof unitUpdateSchema>;
