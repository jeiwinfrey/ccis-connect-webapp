import { NextRequest } from "next/server";
import { db, roomReservations } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { ensureRoomSlotAvailable } from "@/lib/reservations/room";
import { isAdminRole, requireSelfOrAdmin, requireUser } from "@/lib/auth/guards";
import { roomReservationSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse, badRequestResponse, forbiddenResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { RoomReservation } from "@/lib/db/types";
import { notifyAdminsNewRoom } from "@/lib/sms/notifications";

const ROOM_RESERVATION_STATUSES = new Set(["pending", "accepted", "rejected"]);

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status");
    const requestedUserId = request.nextUrl.searchParams.get("user_id");
    const isAdmin = isAdminRole(auth.user.role);
    const userId = isAdmin ? requestedUserId : auth.user.id;

    if (status && !ROOM_RESERVATION_STATUSES.has(status)) {
      return badRequestResponse("Invalid room reservation status");
    }

    if (requestedUserId && requestedUserId !== auth.user.id && !isAdmin) {
      return forbiddenResponse("You can only access your own room reservations");
    }

    const conditions = [];
    if (status) {
      conditions.push(eq(roomReservations.status, status as RoomReservation["status"]));
    }
    if (userId) {
      conditions.push(eq(roomReservations.userId, userId));
    }

    const data = await db.query.roomReservations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: true,
        room: true,
      },
    });

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validatedData = roomReservationSchema.parse(body);

    const ownership = await requireSelfOrAdmin(validatedData.userId);
    if (!ownership.ok) return ownership.response;

    if (auth.user.role === "student") {
      return forbiddenResponse("Students cannot reserve rooms");
    }

    const slot = await ensureRoomSlotAvailable(validatedData);
    if (!slot.ok) return slot.response;

    const [data] = await db
      .insert(roomReservations)
      .values(validatedData)
      .returning();

    // Fetch the complete data with relations
    const completeData = await db.query.roomReservations.findFirst({
      where: eq(roomReservations.id, data.id),
      with: {
        user: true,
        room: true,
      },
    });

    // Fire-and-forget SMS notification to admins
    try {
      const requesterName = completeData?.user?.name ?? "Unknown";
      const roomName = completeData?.room?.name ?? "Unknown";
      notifyAdminsNewRoom(requesterName, roomName).catch((err) => {
        console.error("[SMS] Failed to notify admins about new room reservation:", err);
      });
    } catch (smsError) {
      console.error("[SMS] Failed to initiate admin notification:", smsError);
    }

    return successResponse(completeData, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
