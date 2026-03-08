import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentModelInsert } from "@/lib/supabase/types";

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
    const supabase = await createClient();
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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
