import { db, virtualTourScenes, virtualTourArrows } from "@/lib/db";

async function addExampleScene() {
  const sceneData = {
    id: "room1-entrance",
    title: "Room 1 Entrance",
    panorama: "/panoramic-images/room1-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
  };

  // Insert scene
  await db.insert(virtualTourScenes).values(sceneData);

  // Add arrows - connect to existing lobby
  await db.insert(virtualTourArrows).values({
    sceneId: "room1-entrance",
    arrowId: "to-lobby",
    pitch: "-5deg",
    yaw: "180deg",
    targetSceneId: "lobby",
    label: "Back to Lobby",
    arrowDirection: "left" as const,
  });

  // Also add arrow from lobby to this new room
  await db.insert(virtualTourArrows).values({
    sceneId: "lobby",
    arrowId: "to-room1-entrance",
    pitch: "-5deg",
    yaw: "45deg",
    targetSceneId: "room1-entrance",
    label: "Room 1 Entrance",
    arrowDirection: "right" as const,
  });

  console.log("Example scene 'Room 1 Entrance' added successfully with navigation!");
}

addExampleScene().catch(console.error);