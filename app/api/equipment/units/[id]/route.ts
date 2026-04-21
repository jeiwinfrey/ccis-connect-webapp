import { NextRequest } from "next/server";
import { db, equipmentUnits, borrowRequests, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { unitUpdateSchema } from "@/lib/validations/equipment";
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
    const validatedData = unitUpdateSchema.parse(body);

    const [data] = await db
      .update(equipmentUnits)
      .set(validatedData)
      .where(eq(equipmentUnits.id, id))
      .returning();

    if (!data) {
      return notFoundResponse("Unit");
    }

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "unit_updated",
      detail: `Equipment unit "${validatedData.unitId ?? id}" was updated`,
    });

    return successResponse(data);
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
    const adminId = await getSessionUserId();

    const request = await db.query.borrowRequests.findFirst({
      where: eq(borrowRequests.unitId, id),
    });

    if (request) {
      return conflictResponse("Cannot delete unit while it has borrow request history");
    }

    await db
      .delete(equipmentUnits)
      .where(eq(equipmentUnits.id, id));

    await db.insert(activityLog).values({
      userId: adminId,
      action: "unit_deleted",
      detail: `Equipment unit (id: ${id}) was deleted`,
    });

    return successResponse({ message: "Unit deleted successfully" });
  } catch {
    return errorResponse("Internal server error");
  }
}
