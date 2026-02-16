"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import Image from "next/image";

type SceneId =
  | "lobby"
  | "dit-entrance"
  | "deans-office-entrance"
  | "hyflex1-entrance"
  | "DIT-intersection-1st"
  | "100B-entrance"
  | "IT-stairs"
  | "100A-entrance";
type ArrowDirection = "left" | "right" | "down" | "up";

type SceneConfig = {
  id: SceneId;
  title: string;
  panorama: string;
  startYaw: string;
  startPitch: string;
  arrows: Array<{
    id: string;
    pitch: string;
    yaw: string;
    target: SceneId;
    label: string;
    arrow: ArrowDirection;
  }>;
};

const TABLER_ARROW_SVGS: Record<ArrowDirection, string> = {
  left:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m5 12 6 6"></path><path d="m5 12 6 -6"></path></svg>',
  right:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 18 6 -6"></path><path d="m13 6 6 6"></path></svg>',
  up:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="m18 11 -6 -6"></path><path d="m6 11 6 -6"></path></svg>',
  down:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="m18 13 -6 6"></path><path d="m6 13 6 6"></path></svg>',
};

const SCENES: Record<SceneId, SceneConfig> = {
  "lobby": {
    id: "lobby",
    title: "Lobby",
    panorama: "/panoramic-images/lobby.JPG",
    startYaw: "-70deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-dit-entrance",
        pitch: "-4deg",
        yaw: "-30deg",
        target: "dit-entrance",
        label: "DIT Entrance",
        arrow: "right",
      },
      {
        id: "to-deans-office-entrance",
        pitch: "-4deg",
        yaw: "-110deg",
        target: "deans-office-entrance",
        label: "Dean's Office Entrance",
        arrow: "left",
      },
    ],
  },
  "dit-entrance": {
    id: "dit-entrance",
    title: "DIT Entrance",
    panorama: "/panoramic-images/DIT-entrance.JPG",
    startYaw: "-70deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-hyflex1-entrance",
        pitch: "-20deg",
        yaw: "-70deg",
        target: "hyflex1-entrance",
        label: "Hyflex 1 Entrance",
        arrow: "up",
      },
      {
        id: "to-lobby",
        pitch: "-14deg",
        yaw: "70deg",
        target: "lobby",
        label: "Lobby",
        arrow: "up",
      },
      {
        id: "to-deans-office-entrance",
        pitch: "-15deg",
        yaw: "110deg",
        target: "deans-office-entrance",
        label: "Dean's Office Entrance",
        arrow: "up",
      },
    ],
  },
  "deans-office-entrance": {
    id: "deans-office-entrance",
    title: "Dean's Office Entrance",
    panorama: "/panoramic-images/deans-office-entrance.JPG",
    startYaw: "-60deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-dct-entrance",
        pitch: "-4deg",
        yaw: "-30deg",
        target: "dit-entrance",
        label: "DCT Entrance",
        arrow: "right",
      },
    ],
  },
  "hyflex1-entrance": {
    id: "hyflex1-entrance",
    title: "Hyflex 1 Entrance",
    panorama: "/panoramic-images/hyflex1-entrance.JPG",
    startYaw: "-150deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-dit-intersection-1st",
        pitch: "-20deg",
        yaw: "-150deg",
        target: "DIT-intersection-1st",
        label: "DIT Intersection 1st",
        arrow: "up",
      },
      {
        id: "to-dit-entrance",
        pitch: "-20deg",
        yaw: "30deg",
        target: "dit-entrance",
        label: "DIT Entrance",
        arrow: "up",
      },
    ],
  },
  "DIT-intersection-1st": {
    id: "DIT-intersection-1st",
    title: "DIT Intersection 1st",
    panorama: "/panoramic-images/IT-intersection-1st.JPG",
    startYaw: "-100deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100b-entrance",
        pitch: "-14deg",
        yaw: "-145deg",
        target: "100B-entrance",
        label: "100B Entrance",
        arrow: "left",
      },
      {
        id: "to-it-stairs",
        pitch: "-14deg",
        yaw: "-60deg",
        target: "IT-stairs",
        label: "IT Stairs",
        arrow: "right",
      },
      {
        id: "to-hyflex1-entrance",
        pitch: "-20deg",
        yaw: "90deg",
        target: "hyflex1-entrance",
        label: "Hyflex 1 Entrance",
        arrow: "up",
      },
    ],
  },
  "100B-entrance": {
    id: "100B-entrance",
    title: "100B Entrance",
    panorama: "/panoramic-images/100B-entrance.JPG",
    startYaw: "-150deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100a-entrance",
        pitch: "-20deg",
        yaw: "-150deg",
        target: "100A-entrance",
        label: "100A Entrance",
        arrow: "up",
      },
      {
        id: "to-it-intersection-1st",
        pitch: "-20deg",
        yaw: "30deg",
        target: "DIT-intersection-1st",
        label: "IT Intersection 1st",
        arrow: "up",
      },
    ],
  },
  "100A-entrance": {
    id: "100A-entrance",
    title: "100A Entrance",
    panorama: "/panoramic-images/100A-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100b-entrance",
        pitch: "-20deg",
        yaw: "-90deg",
        target: "100B-entrance",
        label: "100B Entrance",
        arrow: "up",
      },
    ],
  },
  "IT-stairs": {
    id: "IT-stairs",
    title: "IT Stairs",
    panorama: "/panoramic-images/IT-stairs.JPG",
    startYaw: "20deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-it-intersection-1st-from-stairs",
        pitch: "-30deg",
        yaw: "-2deg",
        target: "DIT-intersection-1st",
        label: "IT Intersection 1st",
        arrow: "up",
      },
    ],
  },
};

export default function Tour() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);
  const sceneRef = useRef<SceneId>("lobby");
  const [loading, setLoading] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<"1st" | "2nd">("1st");

  useEffect(() => {
    if (!is3D) {
      return;
    }

    let mounted = true;
    let detachMarkerHandler: (() => void) | null = null;

    const init = async () => {
      if (!containerRef.current) {
        return;
      }

      const [{ Viewer }, { MarkersPlugin }] = await Promise.all([
        import("@photo-sphere-viewer/core"),
        import("@photo-sphere-viewer/markers-plugin"),
      ]);

      if (!mounted || !containerRef.current) {
        return;
      }

      const buildMarkers = (sceneId: SceneId) => {
        return SCENES[sceneId].arrows.map((arrow) => ({
          id: arrow.id,
          position: {
            pitch: arrow.pitch,
            yaw: arrow.yaw,
          },
          html: `<div class="tour-scene-arrow-inner">${TABLER_ARROW_SVGS[arrow.arrow]}</div>`,
          size: {
            width: 42,
            height: 42,
          },
          anchor: "center center",
          tooltip: {
            content: arrow.label,
            position: "top center",
          },
          className: "tour-scene-arrow",
          data: {
            targetScene: arrow.target,
          },
        }));
      };

      const viewer = new Viewer({
        container: containerRef.current,
        panorama: SCENES["lobby"].panorama,
        caption: SCENES["lobby"].title,
        defaultYaw: SCENES["lobby"].startYaw,
        defaultPitch: SCENES["lobby"].startPitch,
        defaultZoomLvl: 0,
        mousewheel: true,
        plugins: [[MarkersPlugin, { markers: buildMarkers("lobby") }]],
        navbar: false,
      });

      viewerRef.current = viewer;
      sceneRef.current = "lobby";

      const markersPlugin = viewer.getPlugin(MarkersPlugin);

      const onSelectMarker = async (event: Event) => {
        const marker = (event as {
          marker?: { data?: { targetScene?: SceneId } };
        }).marker;
        const targetScene = marker?.data?.targetScene;

        if (!targetScene || targetScene === sceneRef.current) {
          return;
        }

        sceneRef.current = targetScene;

        await viewer.setPanorama(SCENES[targetScene].panorama, {
          caption: SCENES[targetScene].title,
          position: {
            yaw: SCENES[targetScene].startYaw,
            pitch: SCENES[targetScene].startPitch,
          },
          zoom: 0,
          speed: "18rpm",
          transition: {
            effect: "fade",
            rotation: false,
            speed: 800,
          },
          showLoader: true,
        });

        markersPlugin.setMarkers(buildMarkers(targetScene));
      };

      markersPlugin.addEventListener("select-marker", onSelectMarker);
      detachMarkerHandler = () => {
        markersPlugin.removeEventListener("select-marker", onSelectMarker);
      };

      if (mounted) {
        setLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
      detachMarkerHandler?.();

      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [is3D]);

  return (
    <section className="px-6 pb-8 pt-4 md:px-10">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Virtual Tour</h1>
          <p className="text-sm text-muted-foreground">
            {is3D 
              ? "Drag to look around, then click the arrow markers to move between scenes."
              : "View the floor plan and navigate between floors."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${is3D ? "text-foreground" : "text-muted-foreground"}`}>
            3D
          </span>
          <Switch checked={!is3D} onCheckedChange={(checked) => setIs3D(!checked)} />
          <span className={`text-sm font-medium ${!is3D ? "text-foreground" : "text-muted-foreground"}`}>
            2D
          </span>
        </div>
      </div>

      {is3D ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div ref={containerRef} className="h-[78vh] min-h-[420px] w-full" />
          </div>
          {loading && <p className="mt-3 text-sm text-muted-foreground">Loading 360 viewer...</p>}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedFloor === "1st" ? "default" : "outline"}
              onClick={() => setSelectedFloor("1st")}
            >
              1st Floor
            </Button>
            <Button
              variant={selectedFloor === "2nd" ? "default" : "outline"}
              onClick={() => setSelectedFloor("2nd")}
            >
              2nd Floor
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative h-[78vh] min-h-[420px] w-full bg-muted">
              <Image
                src={selectedFloor === "1st" ? "/floor-plan/43111.png" : "/floor-plan/67235.png"}
                alt={`${selectedFloor} Floor Plan`}
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.tour-scene-arrow) {
          border-radius: 9999px;
          background: transparent;
          display: grid;
          place-items: center;
          transform: translate(-50%, -50%);
        }

        :global(.tour-scene-arrow-inner) {
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          background: var(--primary);
          color: var(--primary-foreground);
          font-size: 19px;
          font-weight: 700;
          border: 1px solid color-mix(in srgb, var(--primary) 70%, #ffffff);
          box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 30%, transparent);
          transition: transform 0.18s ease;
        }

        :global(.tour-scene-arrow:hover .tour-scene-arrow-inner) {
          transform: scale(1.08);
        }
      `}</style>
    </section>
  );
}
