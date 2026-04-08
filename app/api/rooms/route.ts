import { NextRequest } from "next/server";
import { db, rooms, activityLog } from "@/lib/db";
import { asc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { roomSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";

// GET /api/rooms — list all rooms
export async function GET() {
  try {
    const data = await db
      .select()
      .from(rooms)
      .orderBy(asc(rooms.roomNumber));

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error");
  }
}

// POST /api/rooms — create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = roomSchema.parse(body);

    const [data] = await db
      .insert(rooms)
      .values(validatedData)
      .returning();

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "room_created",
      detail: `Room "${validatedData.name}" (${validatedData.roomNumber}) was created`,
    });

    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return errorResponse("Internal server error");
  }
}
