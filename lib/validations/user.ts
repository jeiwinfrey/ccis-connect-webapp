import { z } from "zod";

const PH_MOBILE_REGEX = /^\+63\d{10}$/;

// User Validation
export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phoneNumber: z.string().regex(PH_MOBILE_REGEX, "Must be a valid Philippine mobile number (+63XXXXXXXXXX)"),
  studentId: z.string().max(50).optional().nullable(),
  department: z.string().min(1, "Department is required").max(100),
  role: z.enum(["student", "faculty", "admin", "super_admin"]),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).optional().nullable(),
  passwordHash: z.string().optional().nullable(),
});

export const userUpdateSchema = userSchema.partial().omit({ phoneNumber: true });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
