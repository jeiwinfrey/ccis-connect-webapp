import { NextRequest } from "next/server";
import { db, rooms, roomAvailability, roomReservations } from "@/lib/db";
import { eq, and, lte, gte, lt, gt, inArray, asc } from "drizzle-orm";
import { successResponse, errorResponse, badRequestResponse } from "@/lib/api/response";

// GET /api/rooms/available?date=YYYY-MM-DD&start_time=HH:MM&end_time=HH:MM
// Returns rooms that are available on the given date and time range.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const startTime = searchParams.get("start_time");
    const endTime = searchParams.get("end_time");

    if (!date || !startTime || !endTime) {
      return badRequestResponse("Missing required query parameters: date, start_time, end_time");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return badRequestResponse("Invalid date format. Expected YYYY-MM-DD");
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return badRequestResponse("Invalid time format. Expected HH:MM");
    }

    // Get day_of_week from the date (0=Sunday ... 6=Saturday)
    const dayOfWeek = new Date(date + "T00:00:00").getDay();

    // Parse requested hours for comparison with room_availability.
    const [startHourStr] = startTime.split(":");
    const [endHourStr, endMinStr] = endTime.split(":");

    const effectiveStartHour = parseInt(startHourStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);

    // If end time has minutes (e.g., 14:30), the room must be available through hour 15
    const effectiveEndHour = endMin > 0 ? endHour + 1 : endHour;

    // Step 1: Find rooms that have availability on this day_of_week
    // covering the requested time range.
    const availableSlots = await db
      .select({ roomId: roomAvailability.roomId })
      .from(roomAvailability)
      .where(
        and(
          eq(roomAvailability.dayOfWeek, dayOfWeek),
          lte(roomAvailability.startHour, effectiveStartHour),
          gte(roomAvailability.endHour, effectiveEndHour)
        )
      );

    if (availableSlots.length === 0) {
      return successResponse([]);
    }

    const availableRoomIds = [
      ...new Set(availableSlots.map((slot) => slot.roomId)),
    ];

    // Step 2: Find accepted reservations that conflict with the requested time.
    const conflictingReservations = await db
      .select({ roomId: roomReservations.roomId })
      .from(roomReservations)
      .where(
        and(
          eq(roomReservations.reservationDate, date),
          eq(roomReservations.status, "accepted"),
          inArray(roomReservations.roomId, availableRoomIds),
          lt(roomReservations.startTime, endTime),
          gt(roomReservations.endTime, startTime)
        )
      );

    const conflictingRoomIds = new Set(
      conflictingReservations.map((r) => r.roomId),
    );

    // Step 3: Filter out rooms with conflicting reservations
    const finalRoomIds = availableRoomIds.filter(
      (id) => !conflictingRoomIds.has(id),
    );

    if (finalRoomIds.length === 0) {
      return successResponse([]);
    }

    // Step 4: Fetch full room details for the available rooms
    const roomsData = await db
      .select()
      .from(rooms)
      .where(inArray(rooms.id, finalRoomIds))
      .orderBy(asc(rooms.roomNumber));

    return successResponse(roomsData);
  } catch {
    return errorResponse("Internal server error");
  }
}
