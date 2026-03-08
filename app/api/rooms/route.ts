import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RoomInsert } from "@/lib/supabase/types";

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
    const supabase = await createClient();
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

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
