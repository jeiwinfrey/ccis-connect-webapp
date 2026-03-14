import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { BorrowRequest, BorrowRequestInsert } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const status = request.nextUrl.searchParams.get("status");
    const userId = request.nextUrl.searchParams.get("user_id");

    let query = supabase
      .from("borrow_requests")
      .select("*, users(*), equipment_units(*, equipment_models(*))");

    if (status) {
      query = query.eq("status", status as BorrowRequest["status"]);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body: BorrowRequestInsert = await request.json();

    if (!body.user_id || !body.unit_id || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "user_id, unit_id, start_date, and end_date are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("borrow_requests")
      .insert(body)
      .select("*, users(*), equipment_units(*, equipment_models(*))")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If the request was auto-accepted, set the unit status to 'on-loan'
    if (body.status === "accepted") {
      const { error: unitError } = await supabase
        .from("equipment_units")
        .update({ status: "on-loan" })
        .eq("id", body.unit_id);

      if (unitError) {
        return NextResponse.json(
          { error: unitError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
