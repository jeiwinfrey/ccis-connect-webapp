import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RoomAvailability, RoomReservation } from "@/lib/supabase/types";

// GET /api/rooms/available?date=YYYY-MM-DD&start_time=HH:MM&end_time=HH:MM
// Returns rooms that are available on the given date and time range.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const startTime = searchParams.get("start_time");
    const endTime = searchParams.get("end_time");

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required query parameters: date, start_time, end_time" },
        { status: 400 },
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Expected HH:MM" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get day_of_week from the date (0=Sunday ... 6=Saturday)
    const dayOfWeek = new Date(date + "T00:00:00").getDay();

    // Parse requested hours for comparison with room_availability.
    // The room's availability window (start_hour to end_hour) must fully
    // contain the requested time range.
    const [startHourStr] = startTime.split(":");
    const [endHourStr, endMinStr] = endTime.split(":");

    const effectiveStartHour = parseInt(startHourStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);

    // If end time has minutes (e.g., 14:30), the room must be available through hour 15
    const effectiveEndHour = endMin > 0 ? endHour + 1 : endHour;

    // Step 1: Find rooms that have availability on this day_of_week
    // covering the requested time range.
    // Room availability start_hour <= requested start AND end_hour >= requested end.
    const { data: availableSlots, error: availError } = (await supabase
      .from("room_availability")
      .select("room_id")
      .eq("day_of_week", dayOfWeek)
      .lte("start_hour", effectiveStartHour)
      .gte("end_hour", effectiveEndHour)) as {
      data: Pick<RoomAvailability, "room_id">[] | null;
      error: any;
    };

    if (availError) {
      return NextResponse.json(
        { error: availError.message },
        { status: 500 },
      );
    }

    if (!availableSlots || availableSlots.length === 0) {
      return NextResponse.json([]);
    }

    const availableRoomIds = [
      ...new Set(availableSlots.map((slot) => slot.room_id)),
    ];

    // Step 2: Find accepted reservations that conflict with the requested time.
    // A reservation conflicts if it's on the same date and the time ranges overlap:
    //   existing.start_time < requested.end_time AND existing.end_time > requested.start_time
    const { data: conflictingReservations, error: resError } = (await supabase
      .from("room_reservations")
      .select("room_id")
      .eq("reservation_date", date)
      .eq("status", "accepted")
      .in("room_id", availableRoomIds)
      .lt("start_time", endTime)
      .gt("end_time", startTime)) as {
      data: Pick<RoomReservation, "room_id">[] | null;
      error: any;
    };

    if (resError) {
      return NextResponse.json(
        { error: resError.message },
        { status: 500 },
      );
    }

    const conflictingRoomIds = new Set(
      (conflictingReservations ?? []).map((r) => r.room_id),
    );

    // Step 3: Filter out rooms with conflicting reservations
    const finalRoomIds = availableRoomIds.filter(
      (id) => !conflictingRoomIds.has(id),
    );

    if (finalRoomIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 4: Fetch full room details for the available rooms
    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .in("id", finalRoomIds)
      .order("room_number", { ascending: true });

    if (roomError) {
      return NextResponse.json(
        { error: roomError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
