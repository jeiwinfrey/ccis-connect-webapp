import { NextRequest } from "next/server";
import { db, users } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { userSchema } from "@/lib/validations/user";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { User } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");

    let result;
    if (role) {
      const roles = role.split(",").map((r) => r.trim()) as User["role"][];
      result = await db
        .select()
        .from(users)
        .where(inArray(users.role, roles));
    } else {
      result = await db.select().from(users);
    }

    return successResponse(result);
  } catch (error) {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const [data] = await db
      .insert(users)
      .values(validatedData)
      .returning();

    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
