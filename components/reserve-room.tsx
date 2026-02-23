"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { topRooms, bottomRooms, type Room } from "@/components/forms/reserve/types";
import { FloorMap } from "@/components/forms/reserve/FloorMap";
import { RoomDialog } from "@/components/forms/reserve/RoomDialog";

export default function ReserveRoom() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <div className="px-10 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Reserve a Room</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click a room to view details and make a reservation.
          </p>
        </CardHeader>
        <CardContent>
          <FloorMap
            topRooms={topRooms}
            bottomRooms={bottomRooms}
            onSelectRoom={setSelectedRoom}
          />
        </CardContent>
      </Card>

      <RoomDialog
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );
}
