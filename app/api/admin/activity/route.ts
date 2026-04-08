import { NextRequest } from "next/server";
import { db, activityLog, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const data = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        action: activityLog.action,
        detail: activityLog.detail,
        createdAt: activityLog.createdAt,
        users: {
          name: users.name,
          email: users.email,
        },
      })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.userId, users.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    return successResponse(data);
  } catch (error) {
    return errorResponse("Internal server error");
  }
}
