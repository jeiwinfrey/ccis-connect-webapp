import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@/lib/supabase/types";

const SESSION_COOKIE = "ccis_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createAdminClient();

    // Look up user by username
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username as string)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const user = data as unknown as User;

    // For demo accounts, password_hash stores the plain password (same as username).
    // In production you'd use bcrypt/argon2 comparison here.
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Set session cookie with user ID
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    // Set role cookie (non-httpOnly so middleware can read it)
    cookieStore.set("ccis_role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

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
