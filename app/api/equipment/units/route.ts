import { NextRequest } from "next/server";
import { db, equipmentUnits, activityLog } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { unitSchema } from "@/lib/validations/equipment";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { EquipmentUnit } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const modelId = request.nextUrl.searchParams.get("model_id");
    const status = request.nextUrl.searchParams.get("status");
    const include = request.nextUrl.searchParams.get("include");

    if (include === "model") {
      const units = await db.query.equipmentUnits.findMany({
        where: status ? eq(equipmentUnits.status, status as EquipmentUnit["status"]) : undefined,
        with: {
          model: {
            with: {
              category: true,
            },
          },
        },
      });
      return successResponse(units);
    }

    let data;
    if (modelId && status) {
      data = await db
        .select()
        .from(equipmentUnits)
        .where(and(
          eq(equipmentUnits.modelId, modelId),
          eq(equipmentUnits.status, status as EquipmentUnit["status"])
        ));
    } else if (modelId) {
      data = await db
        .select()
        .from(equipmentUnits)
        .where(eq(equipmentUnits.modelId, modelId));
    } else if (status) {
      data = await db
        .select()
        .from(equipmentUnits)
        .where(eq(equipmentUnits.status, status as EquipmentUnit["status"]));
    } else {
      data = await db.select().from(equipmentUnits);
    }

    return successResponse(data);
  } catch (error) {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unitSchema.parse(body);

    const [data] = await db
      .insert(equipmentUnits)
      .values(validatedData)
      .returning();

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "unit_created",
      detail: `Equipment unit "${validatedData.unitId}" was created`,
    });

    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
