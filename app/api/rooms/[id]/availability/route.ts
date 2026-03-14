import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { RoomAvailabilityInsert } from "@/lib/supabase/types";

// GET /api/rooms/[id]/availability — get availability schedule for a room
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("room_availability")
      .select("*")
      .eq("room_id", id)
      .order("day_of_week", { ascending: true })
      .order("start_hour", { ascending: true });

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

// POST /api/rooms/[id]/availability — set availability (replaces all existing)
// Body: { availability: Array<{ day_of_week: number, start_hour: number, end_hour: number }> }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body: {
      availability: Array<{
        day_of_week: number;
        start_hour: number;
        end_hour: number;
      }>;
    } = await request.json();

    if (!Array.isArray(body.availability)) {
      return NextResponse.json(
        { error: "Request body must contain an 'availability' array" },
        { status: 400 },
      );
    }

    // Validate each entry
    for (const entry of body.availability) {
      if (
        entry.day_of_week == null ||
        entry.start_hour == null ||
        entry.end_hour == null
      ) {
        return NextResponse.json(
          {
            error:
              "Each availability entry must have day_of_week, start_hour, and end_hour",
          },
          { status: 400 },
        );
      }

      if (entry.day_of_week < 0 || entry.day_of_week > 6) {
        return NextResponse.json(
          { error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)" },
          { status: 400 },
        );
      }

      if (entry.start_hour >= entry.end_hour) {
        return NextResponse.json(
          { error: "start_hour must be less than end_hour" },
          { status: 400 },
        );
      }
    }

    // Delete all existing availability for this room
    const { error: deleteError } = await supabase
      .from("room_availability")
      .delete()
      .eq("room_id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 },
      );
    }

    // Insert new availability records
    if (body.availability.length > 0) {
      const records: RoomAvailabilityInsert[] = body.availability.map(
        (entry) => ({
          room_id: id,
          day_of_week: entry.day_of_week,
          start_hour: entry.start_hour,
          end_hour: entry.end_hour,
        }),
      );

      const { data, error: insertError } = await supabase
        .from("room_availability")
        .insert(records)
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }

      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json([], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
