"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useRoomReservationMutations } from "@/hooks/useRoomReservations";
import { useAuth } from "@/lib/auth/context";
import { type Room } from "./types";

interface RoomDialogProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onReservationComplete?: () => void;
}

export function RoomDialog({ room, open, onClose, onReservationComplete }: RoomDialogProps) {
  const { user } = useAuth();
  const mutations = useRoomReservationMutations();
  const [step, setStep] = useState<"info" | "form" | "confirmed">("info");

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  function resetForm() {
    setStep("info");
    setDate("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room || !date || !startTime || !endTime || !user) return;

    try {
      await mutations.createRoomReservation({
        room_id: room.id,
        user_id: user.id,
        reservation_date: date,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose.trim(),
      });
      setStep("confirmed");
    } catch (err) {
      console.error("Failed to submit reservation:", err);
      toast.error("Failed to submit reservation");
    }
  }

  function handleDone() {
    resetForm();
    onReservationComplete?.();
    onClose();
  }

  if (!room) return null;

  const isVacant = room.status === "vacant";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        {step === "confirmed" ? (
          <div className="flex flex-col items-center text-center gap-4 p-6">
            <DialogTitle className="sr-only">Reservation Submitted</DialogTitle>
            <DialogDescription className="sr-only">Your room reservation has been submitted for review.</DialogDescription>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <IconCircleCheck className="text-green-500 w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reservation Submitted!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your reservation for <span className="font-semibold">{room.name} ({room.room_number})</span> has been submitted for review.
              </p>
            </div>
            <Button className="w-full" onClick={handleDone}>
              Done
            </Button>
          </div>
        ) : step === "form" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
              <p className="text-xs font-semibold text-primary">{room.room_number} &middot; {room.floor}</p>
              <DialogTitle className="text-xl">Reserve {room.name}</DialogTitle>
              <DialogDescription className="sr-only">Fill in details to reserve this room.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Show logged-in user info (read-only) */}
              {user && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.student_id || user.username} &middot; {user.department}
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="res-date" className="text-sm font-semibold">Date</Label>
                <Input
                  id="res-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="res-start" className="text-sm font-semibold">Start Time</Label>
                  <Input
                    id="res-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res-end" className="text-sm font-semibold">End Time</Label>
                  <Input
                    id="res-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-purpose" className="text-sm font-semibold">Purpose</Label>
                <Textarea
                  id="res-purpose"
                  placeholder="Briefly describe the purpose of your reservation..."
                  rows={3}
                  className="resize-none"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
            </form>

            <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 sm:justify-between">
              <Button variant="outline" onClick={() => setStep("info")} type="button">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={mutations.loading || !date || !startTime || !endTime}
              >
                {mutations.loading ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-1" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reservation"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* step === "info" — Room details view */
          <div className="p-6">
            <DialogHeader className="pb-4">
              <p className="text-xs font-semibold text-primary">{room.room_number} &middot; {room.floor}</p>
              <DialogTitle className="text-2xl">{room.name}</DialogTitle>
              <DialogDescription className="sr-only">Room details and reservation option.</DialogDescription>
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
                { label: "Room ID", value: room.room_number },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Would you like to make a reservation for this room?
            </p>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => setStep("form")}
              >
                Reserve Room
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
