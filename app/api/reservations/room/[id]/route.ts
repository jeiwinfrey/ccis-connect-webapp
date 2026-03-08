import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RoomReservation, RoomReservationUpdate } from "@/lib/supabase/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body: RoomReservationUpdate = await request.json();

    // Fetch the existing reservation for logging context
    const { data: existingData, error: fetchError } = await supabase
      .from("room_reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Room reservation not found" },
        { status: 404 },
      );
    }

    const existing = existingData as unknown as RoomReservation;

    // Update the room reservation
    const { data, error } = await supabase
      .from("room_reservations")
      .update(body)
      .eq("id", id)
      .select("*, users(*), rooms(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity for status change actions
    if (body.status && body.status !== existing.status) {
      const actionMap: Record<string, string> = {
        accepted: "room_reservation_approved",
        rejected: "room_reservation_rejected",
      };

      const action = actionMap[body.status];
      if (action) {
        await supabase.from("activity_log").insert({
          user_id: existing.user_id,
          action,
          detail: `Room reservation ${id} status changed from '${existing.status}' to '${body.status}'`,
        });
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
