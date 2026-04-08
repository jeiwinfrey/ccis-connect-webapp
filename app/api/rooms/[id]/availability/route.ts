import { NextRequest } from "next/server";
import { db, roomAvailability } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { roomAvailabilityBatchSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { RoomAvailabilityInsert } from "@/lib/db/types";

// GET /api/rooms/[id]/availability — get availability schedule for a room
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const data = await db
      .select()
      .from(roomAvailability)
      .where(eq(roomAvailability.roomId, id))
      .orderBy(asc(roomAvailability.dayOfWeek), asc(roomAvailability.startHour));

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error");
  }
}

// POST /api/rooms/[id]/availability — set availability (replaces all existing)
// Body: { availability: Array<{ dayOfWeek: number, startHour: number, endHour: number }> }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = roomAvailabilityBatchSchema.parse(body);

    // Delete all existing availability for this room
    await db
      .delete(roomAvailability)
      .where(eq(roomAvailability.roomId, id));

    // Insert new availability records
    if (validatedData.availability.length > 0) {
      const records: RoomAvailabilityInsert[] = validatedData.availability.map(
        (entry) => ({
          roomId: id,
          dayOfWeek: entry.dayOfWeek,
          startHour: entry.startHour,
          endHour: entry.endHour,
        }),
      );

      const data = await db
        .insert(roomAvailability)
        .values(records)
        .returning();

      return successResponse(data, 201);
    }

    return successResponse([], 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
