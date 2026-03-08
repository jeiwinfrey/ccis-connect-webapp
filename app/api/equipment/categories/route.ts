import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentCategoryInsert } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const include = request.nextUrl.searchParams.get("include");

    let query;

    if (include === "models") {
      query = supabase
        .from("equipment_categories")
        .select("*, equipment_models(*, equipment_units(*))");
    } else {
      query = supabase.from("equipment_categories").select("*");
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
    const supabase = await createClient();
    const body: EquipmentCategoryInsert = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("equipment_categories")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
