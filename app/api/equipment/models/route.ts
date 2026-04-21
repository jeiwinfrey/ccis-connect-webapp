import { NextRequest } from "next/server";
import { db, equipmentModels, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { modelSchema } from "@/lib/validations/equipment";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const categoryId = request.nextUrl.searchParams.get("category_id");

    let data;
    if (categoryId) {
      data = await db
        .select()
        .from(equipmentModels)
        .where(eq(equipmentModels.categoryId, categoryId));
    } else {
      data = await db.select().from(equipmentModels);
    }

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validatedData = modelSchema.parse(body);

    const [data] = await db
      .insert(equipmentModels)
      .values(validatedData)
      .returning();

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "model_created",
      detail: `Equipment model "${validatedData.modelName}" was created`,
    });

    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
