"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

type Room = {
  id: string;
  name: string;
  type: string;
  capacity: string;
  floor: string;
  status: string;
};

// Room data — replace with your real data later
const topRooms: Room[] = [
  { id: "R101", name: "Seminar Room B", type: "Seminar Room", capacity: "30 pax", floor: "1st Floor", status: "vacant" },
  { id: "R102", name: "Lab 1", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "vacant" },
  { id: "R103", name: "Lab 2", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "occupied" },
  { id: "R104", name: "Faculty Office", type: "Office", capacity: "10 pax", floor: "1st Floor", status: "occupied" },
];

const bottomRooms: Room[] = [
  { id: "R105", name: "Seminar Room B", type: "Seminar Room", capacity: "30 pax", floor: "1st Floor", status: "vacant" },
  { id: "R106", name: "Lab 1", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "vacant" },
  { id: "R107", name: "Lab 2", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "occupied" },
  { id: "R108", name: "Faculty Office", type: "Office", capacity: "10 pax", floor: "1st Floor", status: "occupied" },
];

function RoomDialog({ room, open, onClose }: { room: Room | null; open: boolean; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  function handleClose() {
    setConfirmed(false);
    onClose();
  }

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {confirmed ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reservation Confirmed!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold">{room.name} ({room.id})</span> has been successfully reserved on {room.floor}.
              </p>
            </div>
            <Button className="w-full bg-indigo-900 hover:bg-indigo-800" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <p className="text-xs font-semibold text-indigo-700">{room.id} • FLOOR 1</p>
              <DialogTitle className="text-2xl">{room.name}</DialogTitle>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-0.5 rounded-full
                ${room.status === "vacant" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${room.status === "vacant" ? "bg-green-500" : "bg-red-500"}`} />
                {room.status === "vacant" ? "Available Now" : "Currently Occupied"}
              </span>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-200 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Room Type</p>
                <p className="font-semibold text-sm">{room.type}</p>
              </div>
              <div className="bg-gray-200 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-semibold text-sm">{room.capacity}</p>
              </div>
              <div className="bg-gray-200 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="font-semibold text-sm">{room.floor}</p>
              </div>
              <div className="bg-gray-200 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Room ID</p>
                <p className="font-semibold text-sm">{room.id}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {room.status === "vacant"
                ? "This room is available. Would you like to reserve it?"
                : "This room is currently occupied and cannot be reserved at this time."}
            </p>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button
                className="flex-1 bg-indigo-900 hover:bg-indigo-800"
                disabled={room.status === "occupied"}
                onClick={() => setConfirmed(true)}
              >
                Confirm Reservation
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
          {/* Floor Map */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">

            {/* Top Row */}
            <div className="grid grid-cols-4 divide-x divide-gray-200">
              {topRooms.map((room) => (
                <div key={room.id} className={`flex flex-col items-center justify-center gap-2 h-32 ${room.status === "vacant" ? "bg-green-50" : "bg-red-50"}`}>
                  <span className="text-sm font-medium text-gray-700">{room.name}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${room.status === "vacant" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${room.status === "vacant" ? "bg-green-500" : "bg-red-500"}`} />
                    {room.status === "vacant" ? "Vacant" : "Occupied"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedRoom(room)}>Reserve</Button>
                </div>
              ))}
            </div>

            {/* Hallway */}
            <div className="bg-gray-100 border-y border-gray-200 flex items-center justify-center py-3">
              <span className="text-xs text-gray-400 font-medium">🏢 Stairs / Lift</span>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-4 divide-x divide-gray-200">
              {bottomRooms.map((room) => (
                <div key={room.id} className={`flex flex-col items-center justify-center gap-2 h-32 ${room.status === "vacant" ? "bg-green-50" : "bg-red-50"}`}>
                  <span className="text-sm font-medium text-gray-700">{room.name}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${room.status === "vacant" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${room.status === "vacant" ? "bg-green-500" : "bg-red-500"}`} />
                    {room.status === "vacant" ? "Vacant" : "Occupied"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedRoom(room)}>Reserve</Button>
                </div>
              ))}
            </div>

          </div>
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