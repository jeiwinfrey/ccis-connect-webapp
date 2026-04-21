import { NextRequest } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin, toSafeUser } from "@/lib/auth/guards";
import { userUpdateSchema } from "@/lib/validations/user";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse, forbiddenResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    const [data] = await db
      .update(users)
      .set(validatedData)
      .where(eq(users.id, id))
      .returning();

    if (!data) {
      return notFoundResponse("User");
    }

    return successResponse(toSafeUser(data));
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;

    if (id === auth.user.id) {
      return forbiddenResponse("You cannot delete your own account");
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      return notFoundResponse("User");
    }

    if (existing.role === "super_admin") {
      return forbiddenResponse("Super admin accounts cannot be deleted");
    }

    await db
      .delete(users)
      .where(eq(users.id, id));

    return successResponse({ message: "User deleted successfully" });
  } catch {
    return errorResponse("Internal server error");
  }
}
