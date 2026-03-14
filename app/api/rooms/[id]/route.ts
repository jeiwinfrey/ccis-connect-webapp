import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { RoomUpdate } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

// PUT /api/rooms/[id] — update a room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
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

    const adminId = await getSessionUserId();
    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "room_updated",
      detail: `Room "${body.name ?? id}" was updated`,
    });

    return NextResponse.json({ data });
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
    const supabase = await createAdminClient();
    const adminId = await getSessionUserId();

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

    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "room_deleted",
      detail: `Room (id: ${id}) was deleted`,
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
