import { NextRequest } from "next/server";
import { db, equipmentCategories, equipmentModels, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { categoryUpdateSchema } from "@/lib/validations/equipment";
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
    const validatedData = categoryUpdateSchema.parse(body);

    const [data] = await db
      .update(equipmentCategories)
      .set(validatedData)
      .where(eq(equipmentCategories.id, id))
      .returning();

    if (!data) {
      return notFoundResponse("Category");
    }

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "category_updated",
      detail: `Equipment category "${validatedData.name ?? id}" was updated`,
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

    const childModel = await db.query.equipmentModels.findFirst({
      where: eq(equipmentModels.categoryId, id),
    });

    if (childModel) {
      return conflictResponse("Cannot delete category while it still has equipment models");
    }

    await db
      .delete(equipmentCategories)
      .where(eq(equipmentCategories.id, id));

    await db.insert(activityLog).values({
      userId: adminId,
      action: "category_deleted",
      detail: `Equipment category (id: ${id}) was deleted`,
    });

    return successResponse({ message: "Category deleted successfully" });
  } catch {
    return errorResponse("Internal server error");
  }
}
