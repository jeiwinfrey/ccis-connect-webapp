import { NextRequest } from "next/server";
import { db, roomReservations } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { roomReservationSchema } from "@/lib/validations/room";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import type { RoomReservation } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const userId = request.nextUrl.searchParams.get("user_id");

    const conditions = [];
    if (status) {
      conditions.push(eq(roomReservations.status, status as RoomReservation["status"]));
    }
    if (userId) {
      conditions.push(eq(roomReservations.userId, userId));
    }

    const data = await db.query.roomReservations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: true,
        room: true,
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
    const validatedData = roomReservationSchema.parse(body);

    const [data] = await db
      .insert(roomReservations)
      .values(validatedData)
      .returning();

    // Fetch the complete data with relations
    const completeData = await db.query.roomReservations.findFirst({
      where: eq(roomReservations.id, data.id),
      with: {
        user: true,
        room: true,
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
