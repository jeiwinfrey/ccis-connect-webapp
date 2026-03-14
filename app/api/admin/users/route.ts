import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { User, UserInsert } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const role = request.nextUrl.searchParams.get("role");

    let query = supabase.from("users").select("*");

    if (role) {
      const roles = role.split(",").map((r) => r.trim()) as User["role"][];
      query = query.in("role", roles);
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
    const body: UserInsert = await request.json();

    if (!body.name || !body.email || !body.role || !body.department) {
      return NextResponse.json(
        { error: "Name, email, role, and department are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
