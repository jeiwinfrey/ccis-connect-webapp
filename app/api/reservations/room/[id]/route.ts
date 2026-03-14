import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { RoomReservation, RoomReservationUpdate } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;
    const body: RoomReservationUpdate = await request.json();

    // Fetch the existing reservation for logging context
    const { data: existingData, error: fetchError } = await supabase
      .from("room_reservations")
      .select("*, users(name), rooms(name)")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Room reservation not found" },
        { status: 404 },
      );
    }

    const existing = existingData as unknown as RoomReservation & {
      users?: { name: string };
      rooms?: { name: string };
    };

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

    // Log activity for status change actions — record the admin who took the action
    if (body.status && body.status !== existing.status) {
      const actionMap: Record<string, string> = {
        accepted: "room_reservation_approved",
        rejected: "room_reservation_rejected",
      };

      const action = actionMap[body.status];
      if (action) {
        const adminId = await getSessionUserId();
        const requesterName = (existing as any).users?.name ?? "unknown";
        const roomName = (existing as any).rooms?.name ?? "unknown room";
        await supabase.from("activity_log").insert({
          user_id: adminId,
          action,
          detail: `Room reservation by "${requesterName}" for "${roomName}" was ${body.status}`,
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
