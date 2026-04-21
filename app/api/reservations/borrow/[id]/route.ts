import { NextRequest } from "next/server";
import { db, borrowRequests, equipmentUnits, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { borrowRequestUpdateSchema } from "@/lib/validations/borrow";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse, conflictResponse } from "@/lib/api/response";
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
    const validatedData = borrowRequestUpdateSchema.parse(body);

    // Fetch the existing borrow request to get unitId and previous status
    const existing = await db.query.borrowRequests.findFirst({
      where: eq(borrowRequests.id, id),
      with: {
        user: true,
      },
    });

    if (!existing) {
      return notFoundResponse("Borrow request");
    }

    // Update the borrow request
    await db
      .update(borrowRequests)
      .set(validatedData)
      .where(eq(borrowRequests.id, id));

    // Handle equipment unit status changes based on new status
    if (validatedData.status && validatedData.status !== existing.status) {
      if (validatedData.status === "accepted") {
        const unit = await db.query.equipmentUnits.findFirst({
          where: eq(equipmentUnits.id, existing.unitId),
        });

        if (!unit) {
          return notFoundResponse("Equipment unit");
        }

        if (unit.status !== "available" && existing.status !== "accepted") {
          return conflictResponse("This equipment unit is no longer available");
        }

        await db
          .update(equipmentUnits)
          .set({ status: "on-loan" })
          .where(eq(equipmentUnits.id, existing.unitId));
      } else if (validatedData.status === "returned" || validatedData.status === "rejected") {
        // When returned or rejected, set unit back to available
        await db
          .update(equipmentUnits)
          .set({ status: "available" })
          .where(eq(equipmentUnits.id, existing.unitId));
      }

      // Log activity — record the admin who took the action
      const actionMap: Record<string, string> = {
        accepted: "borrow_request_approved",
        rejected: "borrow_request_rejected",
        returned: "borrow_request_returned",
      };

      const action = actionMap[validatedData.status];
      if (action) {
        const adminId = await getSessionUserId();
        const requesterName = existing.user?.name ?? "unknown";
        await db.insert(activityLog).values({
          userId: adminId,
          action,
          detail: `Borrow request by "${requesterName}" was ${validatedData.status}`,
        });
      }
    }

    // Fetch the updated data with relations
    const data = await db.query.borrowRequests.findFirst({
      where: eq(borrowRequests.id, id),
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
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
