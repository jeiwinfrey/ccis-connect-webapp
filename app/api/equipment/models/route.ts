import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { EquipmentModelInsert } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const categoryId = request.nextUrl.searchParams.get("category_id");

    let query = supabase.from("equipment_models").select("*");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
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
    const body: EquipmentModelInsert = await request.json();

    if (!body.model_name || !body.category_id) {
      return NextResponse.json(
        { error: "Model name and category_id are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("equipment_models")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminId = await getSessionUserId();
    await supabase.from("activity_log").insert({
      user_id: adminId,
      action: "model_created",
      detail: `Equipment model "${body.model_name}" was created`,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
