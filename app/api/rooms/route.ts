import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { RoomInsert } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

// GET /api/rooms — list all rooms
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/rooms — create a new room
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body: RoomInsert = await request.json();

    if (!body.room_number || !body.name || !body.type || !body.capacity || !body.floor) {
      return NextResponse.json(
        { error: "Missing required fields: room_number, name, type, capacity, floor" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminId = await getSessionUserId();
    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "room_created",
      detail: `Room "${body.name}" (${body.room_number}) was created`,
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
