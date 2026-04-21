import { NextRequest } from "next/server";
import { db, borrowRequests, equipmentUnits } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { isAdminRole, requireSelfOrAdmin, requireUser } from "@/lib/auth/guards";
import { borrowRequestSchema } from "@/lib/validations/borrow";
import { successResponse, errorResponse, validationErrorResponse, conflictResponse, notFoundResponse, badRequestResponse, forbiddenResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { BorrowRequest } from "@/lib/db/types";

const BORROW_STATUSES = new Set(["pending", "accepted", "rejected", "returned"]);

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status");
    const requestedUserId = request.nextUrl.searchParams.get("user_id");
    const isAdmin = isAdminRole(auth.user.role);
    const userId = isAdmin ? requestedUserId : auth.user.id;

    if (status && !BORROW_STATUSES.has(status)) {
      return badRequestResponse("Invalid borrow request status");
    }

    if (requestedUserId && requestedUserId !== auth.user.id && !isAdmin) {
      return forbiddenResponse("You can only access your own borrow requests");
    }

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
            model: {
              with: {
                category: true,
              },
            },
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
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validatedData = borrowRequestSchema.parse(body);

    const ownership = await requireSelfOrAdmin(validatedData.userId);
    if (!ownership.ok) return ownership.response;

    const unit = await db.query.equipmentUnits.findFirst({
      where: eq(equipmentUnits.id, validatedData.unitId),
    });

    if (!unit) {
      return notFoundResponse("Equipment unit");
    }

    if (unit.status !== "available") {
      return conflictResponse("This equipment unit is not available for borrowing");
    }

    const activeRequest = await db
      .select({ id: borrowRequests.id })
      .from(borrowRequests)
      .where(
        and(
          eq(borrowRequests.unitId, validatedData.unitId),
          inArray(borrowRequests.status, ["pending", "accepted"]),
        ),
      )
      .limit(1);

    if (activeRequest.length > 0) {
      return conflictResponse("This equipment unit already has an active or pending borrow request");
    }

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
            model: {
              with: {
                category: true,
              },
            },
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
