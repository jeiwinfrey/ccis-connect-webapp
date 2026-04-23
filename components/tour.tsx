"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import Image from "next/image";

type SceneId = string;
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
        yaw: "-25deg",
        target: "dit-entrance",
        label: "DIT Entrance",
        arrow: "right",
      },
      {
        id: "to-deans-office",
        pitch: "-4deg",
        yaw: "-112deg",  
        target: "deans-office",
        label: "Dean's Office",
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
        id: "to-lobby",
        pitch: "-5deg",
        yaw: "70deg",
        target: "lobby",
        label: "Lobby",
        arrow: "left",
      },
      {
        id: "to-hyflex1-entrance",
        pitch: "-5deg",
        yaw: "-70deg",
        target: "hyflex1-entrance",
        label: "HyFlex 1 Entrance",
        arrow: "up",
      },
    ],
  },
  "hyflex1-entrance": {
    id: "hyflex1-entrance",
    title: "HyFlex 1 Entrance",
    panorama: "/panoramic-images/hyflex1-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-hyflex1",
        pitch: "-5deg",
        yaw: "-60deg",
        target: "hyflex1",
        label: "HyFlex 1",
        arrow: "up",
      },
      {
        id: "to-dit-entrance",
        pitch: "-5deg",
        yaw: "30deg",
        target: "dit-entrance",
        label: "DIT Entrance",
        arrow: "up",
      },
      {
        id: "to-SC Office",
        pitch: "-5deg",
        yaw: "-150deg",
        target: "SC-Office",
        label: "SC Office",
        arrow: "up",
      },
    ],
  },
  "hyflex1": {
    id: "hyflex1",
    title: "HyFlex 1",
    panorama: "/panoramic-images/hyflex1.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-hyflex1-entrance",
        pitch: "-5deg",
        yaw: "94deg",
        target: "hyflex1-entrance",
        label: "HyFlex 1 Entrance",
        arrow: "up",
      },
    ],
  },
  "SC-Office": {
    id: "SC-Office",
    title: "SC Office",
    panorama: "/panoramic-images/IT-intersection-1st.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100B-entrance",
        pitch: "-5deg",
        yaw: "178deg",
        target: "100B-entrance",
        label: "100B Entrance",
        arrow: "up",
      },
      {
        id: "to-hyflex1-entrance",
        pitch: "-5deg",
        yaw: "88deg",
        target: "hyflex1-entrance",
        label: "HyFlex 1 Entrance",
        arrow: "up",
      },
    ],
  },
  "100B-entrance": {
    id: "100B-entrance",
    title: "100B Entrance",
    panorama: "/panoramic-images/100B-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-SC-Office",
        pitch: "-5deg",
        yaw: "27deg",
        target: "SC-Office",
        label: "SC Office",
        arrow: "up",
      },
      {
        id: "to-100A-entrance",
        pitch: "-5deg",
        yaw: "210deg",
        target: "100A-entrance",
        label: "100A Entrance",
        arrow: "up",
      },
      {
        id: "to-100B",
        pitch: "-5deg",
        yaw: "-60deg",
        target: "100B",
        label: "100B",
        arrow: "up",
      },
    ],
  },
  "100B": {
    id: "100B",
    title: "100B",
    panorama: "/panoramic-images/100B.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100B-entrance",
        pitch: "-5deg",
        yaw: "23deg",
        target: "100B-entrance",
        label: "100B Entrance",
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
        id: "to-100B-entrance",
        pitch: "-5deg",
        yaw: "-95deg",
        target: "100B-entrance",
        label: "100B Entrance",
        arrow: "up",
      },
      {
        id: "to-100A",
        pitch: "-5deg",
        yaw: "180deg",
        target: "100A",
        label: "100A",
        arrow: "up",
      },
    ],
  },
  "100A": {
    id: "100A",
    title: "100A",
    panorama: "/panoramic-images/100A.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100A-entrance",
        pitch: "-5deg",
        yaw: "183deg",
        target: "100A-entrance",
        label: "100A Entrance",
        arrow: "up",
      },
    ],
  },
  "deans-office": {
    id: "deans-office",
    title: "Dean's Office",
    panorama: "/panoramic-images/deans-office-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-lobby",
        pitch: "-5deg",
        yaw: "158deg",
        target: "lobby",
        label: "Back to Lobby",
        arrow: "right",
      },
      {
        id: "to-dcs-entrance",
        pitch: "-5deg",
        yaw: "-60deg",
        target: "dcs-entrance",
        label: "DCS Entrance",
        arrow: "up",
      },
    ],
  },
  "dcs-entrance": {
    id: "dcs-entrance",
    title: "DCS Entrance",
    panorama: "/panoramic-images/DCS-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-deans-office",
        pitch: "-4deg",
        yaw: "72deg",
        target: "deans-office",
        label: "Dean's Office",
        arrow: "up",
      },
      {
        id: "to-CS-Soc-and-IT-Soc-Office",
        pitch: "-4deg",
        yaw: "253deg",
        target: "CS-Soc-and-IT-Soc-Office",
        label: "CS Soc and IT Soc Office",
        arrow: "up",
      },
    ],
  },
  "CS-Soc-and-IT-Soc-Office": {
    id: "CS-Soc-and-IT-Soc-Office",
    title: "CS Soc and IT Soc Office",
    panorama: "/panoramic-images/CS-intersection-1st.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-dcs-entrance",
        pitch: "-5deg",
        yaw: "174deg",
        target: "dcs-entrance",
        label: "DCS Entrance",
        arrow: "up",
      },
      {
        id: "to-100C-entrance",
        pitch: "-5deg",
        yaw: "87deg",
        target: "100C-entrance",
        label: "100C Entrance",
        arrow: "up",
      },
    ],
  },
  "100C-entrance": {
    id: "100C-entrance",
    title: "100C Entrance",
    panorama: "/panoramic-images/100C-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-CS-Soc-and-IT-Soc-Office",
        pitch: "-5deg",
        yaw: "-10deg",
        target: "CS-Soc-and-IT-Soc-Office",
        label: "CS Soc and IT Soc Office",
        arrow: "up",
      },
      {
        id: "to-100D-entrance",
        pitch: "-5deg",
        yaw: "-188deg",
        target: "100D-entrance",
        label: "100D Entrance",
        arrow: "up",
      },
      {
        id: "to-100C",
        pitch: "-5deg",
        yaw: "83deg",
        target: "100C",
        label: "100C",
        arrow: "up",
      },
    ],
  },
  "100C": {
    id: "100C",
    title: "100C",
    panorama: "/panoramic-images/100C.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100C-entrance",
        pitch: "-5deg",
        yaw: "23deg",
        target: "100C-entrance",
        label: "100C Entrance",
        arrow: "up",
      },
    ],
  },
  "100D-entrance": {
    id: "100D-entrance",
    title: "100D Entrance",
    panorama: "/panoramic-images/100D-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100C-entrance",
        pitch: "-5deg",
        yaw: "95deg",
        target: "100C-entrance",
        label: "100C Entrance",
        arrow: "up",
      },
      {
        id: "to-100E-entrance",
        pitch: "-5deg",
        yaw: "-85deg",
        target: "100E-entrance",
        label: "100E Entrance",
        arrow: "up",
      },
      {
        id: "to-100D",
        pitch: "-5deg",
        yaw: "-178deg",
        target: "100D",
        label: "100D",
        arrow: "up",
      },
    ],
  },
  "100D": {
    id: "100D",
    title: "100D",
    panorama: "/panoramic-images/100D.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100D-entrance",
        pitch: "-5deg",
        yaw: "-178deg",
        target: "100D-entrance",
        label: "100D Entrance",
        arrow: "up",
      },
    ],
  },
  "100E-entrance": {
    id: "100E-entrance",
    title: "100E Entrance",
    panorama: "/panoramic-images/100E-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100D-entrance",
        pitch: "-5deg",
        yaw: "-20deg",
        target: "100D-entrance",
        label: "100D Entrance",
        arrow: "up",
      },
      {
        id: "to-100F-entrance",
        pitch: "-5deg",
        yaw: "-202deg",
        target: "100F-entrance",
        label: "100F Entrance",
        arrow: "up",
      },
      {
        id: "to-100E",
        pitch: "-5deg",
        yaw: "70deg",
        target: "100E",
        label: "100E",
        arrow: "up",
      },
    ],
  },
  "100E": {
    id: "100E",
    title: "100E",
    panorama: "/panoramic-images/100E.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100E-entrance",
        pitch: "-5deg",
        yaw: "70deg",
        target: "100E-entrance",
        label: "100E Entrance",
        arrow: "up",
      },
    ],
  },
  "100F-entrance": {
    id: "100F-entrance",
    title: "100F Entrance",
    panorama: "/panoramic-images/100F-entrance.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100E-entrance",
        pitch: "-5deg",
        yaw: "2deg",
        target: "100E-entrance",
        label: "100E Entrance",
        arrow: "up",
      },
      {
        id: "to-100F",
        pitch: "-5deg",
        yaw: "95deg",
        target: "100F",
        label: "100F",
        arrow: "up",
      },
    ],
  },
  "100F": {
    id: "100F",
    title: "100F",
    panorama: "/panoramic-images/100F.JPG",
    startYaw: "-90deg",
    startPitch: "0deg",
    arrows: [
      {
        id: "to-100F-entrance",
        pitch: "-5deg",
        yaw: "95deg",
        target: "100F-entrance",
        label: "100F Entrance",
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- speed exists at runtime but is missing from PanoramaOptions type definitions
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
        } as any);

        // @ts-expect-error -- setMarkers exists at runtime but is missing from the plugin type definitions
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
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
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