import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = sessionCookie.value;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // Invalid session — clear cookie
      cookieStore.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 },
      );
    }

    const user = data as unknown as User;

    // Return user data without password_hash
    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
