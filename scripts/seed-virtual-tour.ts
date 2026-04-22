import { db, virtualTourScenes, virtualTourArrows } from "@/lib/db";

const SCENES_DATA = [
  {
    id: "lobby",
    title: "Lobby",
    panorama: "/panoramic-images/lobby.JPG",
    startYaw: "-70deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-dit-entrance",
        pitch: "-4deg",
        yaw: "-30deg",
        targetSceneId: "dit-entrance",
        label: "DIT Entrance",
        arrowDirection: "right" as const,
      },
      {
        arrowId: "to-deans-office-entrance",
        pitch: "-4deg",
        yaw: "-110deg",
        targetSceneId: "deans-office-entrance",
        label: "Dean's Office Entrance",
        arrowDirection: "left" as const,
      },
    ],
  },
  {
    id: "dit-entrance",
    title: "DIT Entrance",
    panorama: "/panoramic-images/DIT-entrance.JPG",
    startYaw: "-70deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-hyflex1-entrance",
        pitch: "-20deg",
        yaw: "-70deg",
        targetSceneId: "hyflex1-entrance",
        label: "Hyflex 1 Entrance",
        arrowDirection: "up" as const,
      },
      {
        arrowId: "to-lobby",
        pitch: "-14deg",
        yaw: "70deg",
        targetSceneId: "lobby",
        label: "Lobby",
        arrowDirection: "up" as const,
      },
      {
        arrowId: "to-deans-office-entrance",
        pitch: "-15deg",
        yaw: "110deg",
        targetSceneId: "deans-office-entrance",
        label: "Dean's Office Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "cs-intersection-1st",
    title: "CS Intersection 1st",
    panorama: "/panoramic-images/CS-intersection-1st.JPG",
    startYaw: "0deg",
    startPitch: "0deg",
    arrows: [],
  },
  {
    id: "deans-office-entrance",
    title: "Dean's Office Entrance",
    panorama: "/panoramic-images/deans-office-entrance.JPG",
    startYaw: "-60deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-dct-entrance",
        pitch: "-20deg",
        yaw: "-60deg",
        targetSceneId: "dct-entrance",
        label: "DCT Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "dct-entrance",
    title: "DCT Entrance",
    panorama: "/panoramic-images/DCT-entrance.JPG",
    startYaw: "-110deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-cs-intersection-1st",
        pitch: "-20deg",
        yaw: "-110deg",
        targetSceneId: "cs-intersection-1st",
        label: "CS Intersection 1st",
        arrowDirection: "up" as const,
      },
      {
        arrowId: "to-deans-office-entrance",
        pitch: "-20deg",
        yaw: "70deg",
        targetSceneId: "deans-office-entrance",
        label: "Dean's Office Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "hyflex1-entrance",
    title: "Hyflex 1 Entrance",
    panorama: "/panoramic-images/hyflex1-entrance.JPG",
    startYaw: "-150deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-dit-intersection-1st",
        pitch: "-20deg",
        yaw: "-150deg",
        targetSceneId: "DIT-intersection-1st",
        label: "DIT Intersection 1st",
        arrowDirection: "up" as const,
      },
      {
        arrowId: "to-dit-entrance",
        pitch: "-20deg",
        yaw: "30deg",
        targetSceneId: "dit-entrance",
        label: "DIT Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "DIT-intersection-1st",
    title: "DIT Intersection 1st",
    panorama: "/panoramic-images/IT-intersection-1st.JPG",
    startYaw: "-100deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-100b-entrance",
        pitch: "-14deg",
        yaw: "-145deg",
        targetSceneId: "100B-entrance",
        label: "100B Entrance",
        arrowDirection: "left" as const,
      },
      {
        arrowId: "to-it-stairs",
        pitch: "-14deg",
        yaw: "-60deg",
        targetSceneId: "IT-stairs",
        label: "IT Stairs",
        arrowDirection: "right" as const,
      },
      {
        arrowId: "to-hyflex1-entrance",
        pitch: "-20deg",
        yaw: "90deg",
        targetSceneId: "hyflex1-entrance",
        label: "Hyflex 1 Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "100B-entrance",
    title: "100B Entrance",
    panorama: "/panoramic-images/100B-entrance.JPG",
    startYaw: "-150deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-100a-entrance",
        pitch: "-20deg",
        yaw: "-150deg",
        targetSceneId: "100A-entrance",
        label: "100A Entrance",
        arrowDirection: "up" as const,
      },
      {
        arrowId: "to-it-intersection-1st",
        pitch: "-20deg",
        yaw: "30deg",
        targetSceneId: "DIT-intersection-1st",
        label: "IT Intersection 1st",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "100A-entrance",
    title: "100A Entrance",
    panorama: "/panoramic-images/100A-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-100b-entrance",
        pitch: "-20deg",
        yaw: "-90deg",
        targetSceneId: "100B-entrance",
        label: "100B Entrance",
        arrowDirection: "up" as const,
      },
    ],
  },
  {
    id: "IT-stairs",
    title: "IT Stairs",
    panorama: "/panoramic-images/IT-stairs.JPG",
    startYaw: "20deg",
    startPitch: "0deg",
    arrows: [
      {
        arrowId: "to-it-intersection-1st-from-stairs",
        pitch: "-30deg",
        yaw: "-2deg",
        targetSceneId: "DIT-intersection-1st",
        label: "IT Intersection 1st",
        arrowDirection: "up" as const,
      },
    ],
  },
];

async function seedVirtualTour() {
  console.log("Seeding virtual tour scenes...");

  for (const sceneData of SCENES_DATA) {
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

  console.log("Virtual tour scenes seeded successfully!");
}

seedVirtualTour().catch(console.error);