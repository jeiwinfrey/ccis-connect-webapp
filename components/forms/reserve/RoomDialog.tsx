"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconCircleCheck } from "@tabler/icons-react";
import { type Room } from "./types";

interface RoomDialogProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
}

export function RoomDialog({ room, open, onClose }: RoomDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  function handleClose() {
    setConfirmed(false);
    onClose();
  }

  if (!room) return null;

  const isVacant = room.status === "vacant";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {confirmed ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <IconCircleCheck className="text-green-500 w-8 h-8" />
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
                ${isVacant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVacant ? "bg-green-500" : "bg-red-500"}`} />
                {isVacant ? "Available Now" : "Currently Occupied"}
              </span>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { label: "Room Type", value: room.type },
                { label: "Capacity", value: room.capacity },
                { label: "Floor", value: room.floor },
                { label: "Room ID", value: room.id },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-200 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {isVacant
                ? "This room is available. Would you like to reserve it?"
                : "This room is currently occupied and cannot be reserved at this time."}
            </p>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button
                className="flex-1 bg-indigo-900 hover:bg-indigo-800"
                disabled={!isVacant}
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
