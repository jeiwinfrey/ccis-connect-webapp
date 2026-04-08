import { NextRequest } from "next/server";
import { db, roomReservations, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { roomReservationUpdateSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = roomReservationUpdateSchema.parse(body);

    // Fetch the existing reservation for logging context
    const existing = await db.query.roomReservations.findFirst({
      where: eq(roomReservations.id, id),
      with: {
        user: true,
        room: true,
      },
    });

    if (!existing) {
      return notFoundResponse("Room reservation");
    }

    // Update the room reservation
    await db
      .update(roomReservations)
      .set(validatedData)
      .where(eq(roomReservations.id, id));

    // Log activity for status change actions — record the admin who took the action
    if (validatedData.status && validatedData.status !== existing.status) {
      const actionMap: Record<string, string> = {
        accepted: "room_reservation_approved",
        rejected: "room_reservation_rejected",
      };

      const action = actionMap[validatedData.status];
      if (action) {
        const adminId = await getSessionUserId();
        const requesterName = existing.user?.name ?? "unknown";
        const roomName = existing.room?.name ?? "unknown room";
        await db.insert(activityLog).values({
          userId: adminId,
          action,
          detail: `Room reservation by "${requesterName}" for "${roomName}" was ${validatedData.status}`,
        });
      }
    }

    // Fetch the updated data with relations
    const data = await db.query.roomReservations.findFirst({
      where: eq(roomReservations.id, id),
      with: {
        user: true,
        room: true,
      },
    });

    return successResponse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
