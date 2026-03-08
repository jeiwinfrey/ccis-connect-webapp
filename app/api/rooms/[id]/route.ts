import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RoomUpdate } from "@/lib/supabase/types";

// PUT /api/rooms/[id] — update a room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body: RoomUpdate = await request.json();

    const { data, error } = await supabase
      .from("rooms")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/rooms/[id] — delete a room (only if no future reservations)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check for future reservations with status 'accepted' or 'pending'
    const today = new Date().toISOString().split("T")[0];

    const { data: futureReservations, error: reservationError } = await supabase
      .from("room_reservations")
      .select("id")
      .eq("room_id", id)
      .gte("reservation_date", today)
      .in("status", ["accepted", "pending"])
      .limit(1);

    if (reservationError) {
      return NextResponse.json(
        { error: reservationError.message },
        { status: 500 },
      );
    }

    if (futureReservations && futureReservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with future reservations" },
        { status: 409 },
      );
    }

    // Delete associated availability records first
    const { error: availabilityError } = await supabase
      .from("room_availability")
      .delete()
      .eq("room_id", id);

    if (availabilityError) {
      return NextResponse.json(
        { error: availabilityError.message },
        { status: 500 },
      );
    }

    // Delete the room
    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
