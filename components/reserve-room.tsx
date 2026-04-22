"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconLoader2 } from "@tabler/icons-react";
import { useRooms } from "@/hooks/useRooms";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { mapRoomsToUI, splitRooms, type Room } from "@/components/features/reserve/types";
import { FloorMap } from "@/components/features/reserve/FloorMap";
import { RoomDialog } from "@/components/features/reserve/RoomDialog";

const ROOM_TYPES = ["All", "Lecture", "HyFlex", "Lab Room"] as const;
type RoomTypeFilter = (typeof ROOM_TYPES)[number];

export default function ReserveRoom() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>("All");

  const { rooms: rawRooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const { reservations: activeReservations, loading: resLoading, refetch: refetchReservations } =
    useRoomReservations("accepted");

  const loading = roomsLoading || resLoading;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchRooms();
        refetchReservations();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetchRooms, refetchReservations]);

  const allRooms = mapRoomsToUI(rawRooms, activeReservations);

  // Split by floor
  const floor1Rooms = allRooms.filter((r) => r.floor === "1st Floor");
  const floor2Rooms = allRooms.filter((r) => r.floor === "2nd Floor");

  // Apply type filter
  function applyTypeFilter(rooms: Room[]) {
    if (typeFilter === "All") return rooms;
    return rooms.filter((r) => r.type.toLowerCase() === typeFilter.toLowerCase());
  }

  const vacantCount = allRooms.filter((r) => r.status === "vacant").length;
  const occupiedCount = allRooms.filter((r) => r.status === "occupied").length;

  function handleReservationComplete() {
    refetchRooms();
    refetchReservations();
    setSelectedRoom(null);
  }

  function renderFloorContent(rooms: Room[]) {
    const filtered = applyTypeFilter(rooms);
    const { topRooms, bottomRooms } = splitRooms(filtered);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No rooms match the selected filter.
        </div>
      );
    }

    return (
      <FloorMap
        topRooms={topRooms}
        bottomRooms={bottomRooms}
        onSelectRoom={setSelectedRoom}
      />
    );
  }

  return (
    <div className="px-4 py-4 md:px-10 md:py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reserve a Room</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click a room to view details and make a reservation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                {vacantCount} Vacant
              </Badge>
              <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                {occupiedCount} Occupied
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading rooms...
            </div>
          ) : allRooms.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No rooms found.
            </div>
          ) : (
            <>
              {/* Room type filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {ROOM_TYPES.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={typeFilter === type ? "default" : "outline"}
                    onClick={() => setTypeFilter(type)}
                    className="h-7 text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* Floor tabs */}
              <Tabs defaultValue="floor1">
                <TabsList>
                  <TabsTrigger value="floor1">1st Floor</TabsTrigger>
                  <TabsTrigger value="floor2">2nd Floor</TabsTrigger>
                </TabsList>

                <TabsContent value="floor1" className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Floor Plan — 1st Floor
                  </p>
                  {renderFloorContent(floor1Rooms)}
                </TabsContent>

                <TabsContent value="floor2" className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Floor Plan — 2nd Floor
                  </p>
                  {renderFloorContent(floor2Rooms)}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      <RoomDialog
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onReservationComplete={handleReservationComplete}
      />
    </div>
  );
}
