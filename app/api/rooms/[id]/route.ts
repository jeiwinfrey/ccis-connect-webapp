import { NextRequest } from "next/server";
import { db, rooms, roomAvailability, roomReservations, activityLog } from "@/lib/db";
import { eq, and, gte, inArray } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { roomUpdateSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse, conflictResponse } from "@/lib/api/response";
import { ZodError } from "zod";

// PUT /api/rooms/[id] — update a room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = roomUpdateSchema.parse(body);

    const [data] = await db
      .update(rooms)
      .set(validatedData)
      .where(eq(rooms.id, id))
      .returning();

    if (!data) {
      return notFoundResponse("Room");
    }

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "room_updated",
      detail: `Room "${validatedData.name ?? id}" was updated`,
    });

    return successResponse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}

// DELETE /api/rooms/[id] — delete a room (only if no future reservations)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminId = await getSessionUserId();

    // Check for future reservations with status 'accepted' or 'pending'
    const today = new Date().toISOString().split("T")[0];

    const futureReservations = await db
      .select({ id: roomReservations.id })
      .from(roomReservations)
      .where(
        and(
          eq(roomReservations.roomId, id),
          gte(roomReservations.reservationDate, today),
          inArray(roomReservations.status, ["accepted", "pending"])
        )
      )
      .limit(1);

    if (futureReservations.length > 0) {
      return conflictResponse("Cannot delete room with future reservations");
    }

    // Delete associated availability records first
    await db
      .delete(roomAvailability)
      .where(eq(roomAvailability.roomId, id));

    // Delete the room
    await db
      .delete(rooms)
      .where(eq(rooms.id, id));

    await db.insert(activityLog).values({
      userId: adminId,
      action: "room_deleted",
      detail: `Room (id: ${id}) was deleted`,
    });

    return successResponse({ message: "Room deleted successfully" });
  } catch {
    return errorResponse("Internal server error");
  }
}
