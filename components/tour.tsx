"use client";

import { useEffect, useRef, useState } from "react";

type SceneId = "library-entrance" | "main-hall";

type SceneConfig = {
  id: SceneId;
  title: string;
  panorama: string;
  arrows: Array<{
    id: string;
    pitch: string;
    yaw: string;
    target: SceneId;
    label: string;
  }>;
};

const SCENES: Record<SceneId, SceneConfig> = {
  "library-entrance": {
    id: "library-entrance",
    title: "Library Entrance",
    panorama: "/panoramic-images/kris-guico-rsB-he-ye7w-unsplash.jpg",
    arrows: [
      {
        id: "to-main-hall",
        pitch: "-4deg",
        yaw: "34deg",
        target: "main-hall",
        label: "Main Hall",
      },
    ],
  },
  "main-hall": {
    id: "main-hall",
    title: "Main Hall",
    panorama: "/panoramic-images/timothy-oldfield-luufnHoChRU-unsplash.jpg",
    arrows: [
      {
        id: "to-entrance",
        pitch: "-4deg",
        yaw: "-138deg",
        target: "library-entrance",
        label: "Entrance",
      },
    ],
  },
};

export default function Tour() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);
  const sceneRef = useRef<SceneId>("library-entrance");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          html: '<div class="tour-scene-arrow-inner">&#10140;</div>',
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
        panorama: SCENES["library-entrance"].panorama,
        caption: SCENES["library-entrance"].title,
        defaultYaw: "0deg",
        defaultPitch: "0deg",
        defaultZoomLvl: 45,
        mousewheel: true,
        plugins: [[MarkersPlugin, { markers: buildMarkers("library-entrance") }]],
        navbar: ["zoom", "move", "fullscreen"],
      });

      viewerRef.current = viewer;
      sceneRef.current = "library-entrance";

      const markersPlugin = viewer.getPlugin(MarkersPlugin);

      const onSelectMarker = async (event: Event) => {
        const marker = (event as { marker?: { data?: { targetScene?: SceneId } } }).marker;
        const targetScene = marker?.data?.targetScene;

        if (!targetScene || targetScene === sceneRef.current) {
          return;
        }

        sceneRef.current = targetScene;

        await viewer.setPanorama(SCENES[targetScene].panorama, {
          caption: SCENES[targetScene].title,
          speed: "18rpm",
          transition: true,
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
  }, []);

  return (
    <section className="px-6 pb-8 pt-4 md:px-10">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-foreground">Virtual Tour</h1>
        <p className="text-sm text-muted-foreground">Drag to look around, then click the arrow markers to move between scenes.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div ref={containerRef} className="h-[65vh] min-h-[420px] w-full" />
      </div>

      {loading && <p className="mt-3 text-sm text-muted-foreground">Loading 360 viewer...</p>}

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
