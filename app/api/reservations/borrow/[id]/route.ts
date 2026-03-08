import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BorrowRequest, BorrowRequestUpdate } from "@/lib/supabase/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body: BorrowRequestUpdate = await request.json();

    // Fetch the existing borrow request to get unit_id and previous status
    const { data: existingData, error: fetchError } = await supabase
      .from("borrow_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Borrow request not found" },
        { status: 404 },
      );
    }

    const existing = existingData as unknown as BorrowRequest;

    // Update the borrow request
    const { data, error } = await supabase
      .from("borrow_requests")
      .update(body)
      .eq("id", id)
      .select("*, users(*), equipment_units(*, equipment_models(*))")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle equipment unit status changes based on new status
    if (body.status && body.status !== existing.status) {
      if (body.status === "accepted") {
        const { error: unitError } = await supabase
          .from("equipment_units")
          .update({ status: "on-loan" })
          .eq("id", existing.unit_id);

        if (unitError) {
          return NextResponse.json(
            { error: unitError.message },
            { status: 500 },
          );
        }
      } else if (body.status === "returned") {
        const { error: unitError } = await supabase
          .from("equipment_units")
          .update({ status: "available" })
          .eq("id", existing.unit_id);

        if (unitError) {
          return NextResponse.json(
            { error: unitError.message },
            { status: 500 },
          );
        }
      }
      // 'rejected' - keep unit status as-is

      // Log activity for status change actions
      const actionMap: Record<string, string> = {
        accepted: "borrow_request_approved",
        rejected: "borrow_request_rejected",
        returned: "borrow_request_returned",
      };

      const action = actionMap[body.status];
      if (action) {
        await supabase.from("activity_log").insert({
          user_id: existing.user_id,
          action,
          detail: `Borrow request ${id} status changed from '${existing.status}' to '${body.status}'`,
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
