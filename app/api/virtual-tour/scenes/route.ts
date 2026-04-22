import { NextRequest } from "next/server";
import { db, virtualTourScenes, virtualTourArrows, activityLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getSessionUserId } from "@/lib/auth/session";

export async function GET() {
  try {
    // Fetch all scenes
    const scenes = await db.select().from(virtualTourScenes);

    // Fetch all arrows
    const arrows = await db.select().from(virtualTourArrows);

    // Group arrows by sceneId
    const arrowsByScene = arrows.reduce((acc, arrow) => {
      if (!acc[arrow.sceneId]) {
        acc[arrow.sceneId] = [];
      }
      acc[arrow.sceneId].push({
        id: arrow.arrowId,
        pitch: arrow.pitch,
        yaw: arrow.yaw,
        target: arrow.targetSceneId,
        label: arrow.label,
        arrow: arrow.arrowDirection,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Combine scenes with their arrows
    const scenesWithArrows = scenes.map(scene => ({
      id: scene.id,
      title: scene.title,
      panorama: scene.panorama,
      startYaw: scene.startYaw,
      startPitch: scene.startPitch,
      arrows: arrowsByScene[scene.id] || [],
    }));

    return successResponse(scenesWithArrows);
  } catch (error) {
    console.error("Error fetching virtual tour scenes:", error);
    return errorResponse("Internal server error");
  }
}

// POST /api/virtual-tour/scenes — create a new scene
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, panorama, startYaw, startPitch, arrows = [] } = body;

    // Insert scene
    await db.insert(virtualTourScenes).values({
      id,
      title,
      panorama,
      startYaw,
      startPitch,
    });

    // Insert arrows
    for (const arrow of arrows) {
      await db.insert(virtualTourArrows).values({
        sceneId: id,
        arrowId: arrow.id,
        pitch: arrow.pitch,
        yaw: arrow.yaw,
        targetSceneId: arrow.target,
        label: arrow.label,
        arrowDirection: arrow.arrow,
      });
    }

    const adminId = await getSessionUserId();
    await db.insert(activityLog).values({
      userId: adminId,
      action: "virtual_tour_scene_created",
      detail: `Virtual tour scene "${title}" (${id}) was created`,
    });

    return successResponse({ id, title, panorama, startYaw, startPitch, arrows }, 201);
  } catch (error) {
    console.error("Error creating virtual tour scene:", error);
    return errorResponse("Internal server error");
  }
}