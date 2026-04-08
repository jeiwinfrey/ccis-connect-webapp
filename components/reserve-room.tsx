"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconLoader2 } from "@tabler/icons-react";
import { useRooms } from "@/hooks/useRooms";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { mapRoomsToUI, splitRooms, type Room } from "@/components/features/reserve/types";
import { FloorMap } from "@/components/features/reserve/FloorMap";
import { RoomDialog } from "@/components/features/reserve/RoomDialog";

export default function ReserveRoom() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Fetch rooms and active reservations from Supabase
  const { rooms: rawRooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const { reservations: activeReservations, loading: resLoading, refetch: refetchReservations } =
    useRoomReservations("accepted");

  const loading = roomsLoading || resLoading;

  // Auto-refresh when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchRooms();
        refetchReservations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchRooms, refetchReservations]);

  // Map to UI rooms with occupancy status
  const allRooms = mapRoomsToUI(rawRooms, activeReservations);
  const { topRooms, bottomRooms } = splitRooms(allRooms);

  const vacantCount = allRooms.filter((r) => r.status === "vacant").length;
  const occupiedCount = allRooms.filter((r) => r.status === "occupied").length;

  function handleReservationComplete() {
    refetchRooms();
    refetchReservations();
    setSelectedRoom(null);
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
        <CardContent className="space-y-3">
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Floor Plan — CCIS Building
              </p>
              <FloorMap
                topRooms={topRooms}
                bottomRooms={bottomRooms}
                onSelectRoom={setSelectedRoom}
              />
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
