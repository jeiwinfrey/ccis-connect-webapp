import { db, virtualTourScenes, virtualTourArrows } from "@/lib/db";

async function addMultipleScenes() {
  const newScenes = [
    {
      id: "room1-entrance",
      title: "Room 1 Entrance",
      panorama: "/panoramic-images/room1-entrance.JPG",
      startYaw: "-90deg",
      startPitch: "0deg",
      arrows: [
        {
          arrowId: "to-lobby",
          pitch: "-5deg",
          yaw: "180deg",
          targetSceneId: "lobby",
          label: "Back to Lobby",
          arrowDirection: "left" as const,
        }
      ]
    },
    {
      id: "room2-entrance",
      title: "Room 2 Entrance",
      panorama: "/panoramic-images/room2-entrance.JPG",
      startYaw: "-90deg",
      startPitch: "0deg",
      arrows: [
        {
          arrowId: "to-room1-entrance",
          pitch: "-5deg",
          yaw: "90deg",
          targetSceneId: "room1-entrance",
          label: "Room 1 Entrance",
          arrowDirection: "up" as const,
        }
      ]
    },
    {
      id: "room3-entrance",
      title: "Room 3 Entrance",
      panorama: "/panoramic-images/room3-entrance.JPG",
      startYaw: "-90deg",
      startPitch: "0deg",
      arrows: [
        {
          arrowId: "to-room2-entrance",
          pitch: "-5deg",
          yaw: "90deg",
          targetSceneId: "room2-entrance",
          label: "Room 2 Entrance",
          arrowDirection: "up" as const,
        }
      ]
    }
  ];

  for (const sceneData of newScenes) {
    // Insert scene
    await db.insert(virtualTourScenes).values({
      id: sceneData.id,
      title: sceneData.title,
      panorama: sceneData.panorama,
      startYaw: sceneData.startYaw,
      startPitch: sceneData.startPitch,
    });

    // Insert arrows
    for (const arrow of sceneData.arrows) {
      await db.insert(virtualTourArrows).values({
        sceneId: sceneData.id,
        arrowId: arrow.arrowId,
        pitch: arrow.pitch,
        yaw: arrow.yaw,
        targetSceneId: arrow.targetSceneId,
        label: arrow.label,
        arrowDirection: arrow.arrowDirection,
      });
    }
  }

  // Add navigation from lobby to room1
  await db.insert(virtualTourArrows).values({
    sceneId: "lobby",
    arrowId: "to-room1-entrance",
    pitch: "-5deg",
    yaw: "45deg",
    targetSceneId: "room1-entrance",
    label: "Room 1 Entrance",
    arrowDirection: "right" as const,
  });

  console.log("Added 3 new scenes: Room 1, Room 2, and Room 3 entrances!");
}

addMultipleScenes().catch(console.error);