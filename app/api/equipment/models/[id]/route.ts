import { NextRequest } from "next/server";
import { db, equipmentModels, equipmentUnits, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { modelUpdateSchema } from "@/lib/validations/equipment";
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
    const validatedData = modelUpdateSchema.parse(body);

    const [data] = await db
      .update(equipmentModels)
      .set(validatedData)
      .where(eq(equipmentModels.id, id))
      .returning();

    if (!data) {
      return notFoundResponse("Model");
    }

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "model_updated",
      detail: `Equipment model "${validatedData.modelName ?? id}" was updated`,
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

    const childUnit = await db.query.equipmentUnits.findFirst({
      where: eq(equipmentUnits.modelId, id),
    });

    if (childUnit) {
      return conflictResponse("Cannot delete model while it still has equipment units");
    }

    await db
      .delete(equipmentModels)
      .where(eq(equipmentModels.id, id));

    await db.insert(activityLog).values({
      userId: adminId,
      action: "model_deleted",
      detail: `Equipment model (id: ${id}) was deleted`,
    });

    return successResponse({ message: "Model deleted successfully" });
  } catch {
    return errorResponse("Internal server error");
  }
}
