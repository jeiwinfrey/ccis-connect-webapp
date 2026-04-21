import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId, clearSession } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/guards";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      // Invalid session — clear cookie
      await clearSession();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 },
      );
    }

    return NextResponse.json(toSafeUser(user));
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
