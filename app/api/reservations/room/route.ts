import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { RoomReservation, RoomReservationInsert } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const status = request.nextUrl.searchParams.get("status");
    const userId = request.nextUrl.searchParams.get("user_id");

    let query = supabase
      .from("room_reservations")
      .select("*, users(*), rooms(*)");

    if (status) {
      query = query.eq("status", status as RoomReservation["status"]);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body: RoomReservationInsert = await request.json();

    if (
      !body.room_id ||
      !body.user_id ||
      !body.reservation_date ||
      !body.start_time ||
      !body.end_time
    ) {
      return NextResponse.json(
        {
          error:
            "room_id, user_id, reservation_date, start_time, and end_time are required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("room_reservations")
      .insert(body)
      .select("*, users(*), rooms(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
