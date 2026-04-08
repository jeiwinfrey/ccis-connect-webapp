import { NextRequest } from "next/server";
import { db, borrowRequests, equipmentUnits } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { borrowRequestSchema } from "@/lib/validations/borrow";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { BorrowRequest } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const userId = request.nextUrl.searchParams.get("user_id");

    const conditions = [];
    if (status) {
      conditions.push(eq(borrowRequests.status, status as BorrowRequest["status"]));
    }
    if (userId) {
      conditions.push(eq(borrowRequests.userId, userId));
    }

    const data = await db.query.borrowRequests.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: true,
        unit: {
          with: {
            model: true,
          },
        },
      },
    });

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = borrowRequestSchema.parse(body);

    const [data] = await db
      .insert(borrowRequests)
      .values(validatedData)
      .returning();

    // If the request was auto-accepted, set the unit status to 'on-loan'
    if (validatedData.status === "accepted") {
      await db
        .update(equipmentUnits)
        .set({ status: "on-loan" })
        .where(eq(equipmentUnits.id, validatedData.unitId));
    }

    // Fetch the complete data with relations
    const completeData = await db.query.borrowRequests.findFirst({
      where: eq(borrowRequests.id, data.id),
      with: {
        user: true,
        unit: {
          with: {
            model: true,
          },
        },
      },
    });

    return successResponse(completeData, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
