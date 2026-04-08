import { NextRequest } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { userUpdateSchema } from "@/lib/validations/user";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    return successResponse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await db
      .delete(users)
      .where(eq(users.id, id));

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    return errorResponse("Internal server error");
  }
}
