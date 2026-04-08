import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/user";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Look up user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username))
      .limit(1);

    if (!user) {
      return unauthorizedResponse("Invalid username or password");
    }

    // For demo accounts, passwordHash stores the plain password (same as username).
    // In production you'd use bcrypt/argon2 comparison here.
    if (user.passwordHash !== validatedData.password) {
      return unauthorizedResponse("Invalid username or password");
    }

    // Set session cookies
    await setSession(user.id, user.role);

    // Return user data without passwordHash
    const { passwordHash: _, ...safeUser } = user;
    return successResponse(safeUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
