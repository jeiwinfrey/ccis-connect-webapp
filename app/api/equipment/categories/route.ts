import { NextRequest } from "next/server";
import { db, equipmentCategories, activityLog } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/equipment";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const include = request.nextUrl.searchParams.get("include");

    if (include === "models") {
      const categories = await db.query.equipmentCategories.findMany({
        with: {
          models: {
            with: {
              units: true,
            },
          },
        },
      });
      return successResponse(categories);
    } else {
      const data = await db.select().from(equipmentCategories);
      return successResponse(data);
    }
  } catch (error) {
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const [data] = await db
      .insert(equipmentCategories)
      .values(validatedData)
      .returning();

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "category_created",
      detail: `Equipment category "${validatedData.name}" was created`,
    });

    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
