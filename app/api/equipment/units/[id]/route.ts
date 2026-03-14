import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { EquipmentUnitUpdate } from "@/lib/supabase/types";

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
    const { id } = await params;
    const supabase = await createAdminClient();
    const body: EquipmentUnitUpdate = await request.json();

    const { data, error } = await supabase
      .from("equipment_units")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Unit not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminId = await getSessionUserId();
    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "unit_updated",
      detail: `Equipment unit "${body.unit_id ?? id}" was updated`,
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const adminId = await getSessionUserId();

    const { error } = await supabase
      .from("equipment_units")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "unit_deleted",
      detail: `Equipment unit (id: ${id}) was deleted`,
    });

    return NextResponse.json(
      { message: "Unit deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
