import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { EquipmentUnit, EquipmentUnitInsert } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const modelId = request.nextUrl.searchParams.get("model_id");
    const status = request.nextUrl.searchParams.get("status");
    const include = request.nextUrl.searchParams.get("include");

    const selectClause =
      include === "model"
        ? "*, equipment_models(*, equipment_categories(*))"
        : "*";

    let query = supabase.from("equipment_units").select(selectClause);

    if (modelId) {
      query = query.eq("model_id", modelId);
    }

    if (status) {
      query = query.eq("status", status as EquipmentUnit["status"]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body: EquipmentUnitInsert = await request.json();

    if (!body.model_id || !body.unit_id) {
      return NextResponse.json(
        { error: "model_id and unit_id are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("equipment_units")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminId = await getSessionUserId();
    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "unit_created",
      detail: `Equipment unit "${body.unit_id}" was created`,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
