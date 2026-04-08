import { z } from "zod";

// Room Validation
export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().min(1, "Type is required").max(50),
  capacity: z.string().min(1, "Capacity is required").max(50),
  floor: z.string().min(1, "Floor is required").max(20),
});

export const roomUpdateSchema = roomSchema.partial();

// Room Availability Validation
export const roomAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
}).refine((data) => data.startHour < data.endHour, {
  message: "Start hour must be before end hour",
});

export const roomAvailabilityBatchSchema = z.object({
  availability: z.array(roomAvailabilitySchema),
});

// Room Reservation Validation
export const roomReservationSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  userId: z.string().uuid("Invalid user ID"),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:MM)"),
  purpose: z.string().min(1, "Purpose is required").max(500),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  adminNotes: z.string().max(500).optional(),
});

export const roomReservationUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  adminNotes: z.string().max(500).optional(),
});

// Types
export type RoomInput = z.infer<typeof roomSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
export type RoomAvailabilityInput = z.infer<typeof roomAvailabilitySchema>;
export type RoomAvailabilityBatchInput = z.infer<typeof roomAvailabilityBatchSchema>;
export type RoomReservationInput = z.infer<typeof roomReservationSchema>;
export type RoomReservationUpdateInput = z.infer<typeof roomReservationUpdateSchema>;
