"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { useRoomAvailability } from "@/hooks/useRooms";
import { useAuth } from "@/lib/auth/context";
import { type Room } from "./types";
import type { RoomAvailability } from "@/lib/supabase/types";

interface RoomDialogProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onReservationComplete?: () => void;
}

function getAvailableStartHours(availability: RoomAvailability[], date: string): number[] {
  if (!date) return [];
  const dayOfWeek = new Date(date).getDay();
  const hours: number[] = [];
  for (const slot of availability) {
    if (slot.day_of_week !== dayOfWeek) continue;
    for (let h = slot.start_hour; h < slot.end_hour; h++) {
      hours.push(h);
    }
  }
  return hours.sort((a, b) => a - b);
}

function getAvailableEndHours(availability: RoomAvailability[], startHour: number | null): number[] {
  if (startHour == null) return [];
  const slot = availability.find(s => s.start_hour <= startHour && s.end_hour > startHour);
  if (!slot) return [];
  const hours: number[] = [];
  for (let h = startHour + 1; h <= slot.end_hour; h++) {
    hours.push(h);
  }
  return hours;
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

function toTimeString(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function RoomDialog({ room, open, onClose, onReservationComplete }: RoomDialogProps) {
  const { user } = useAuth();
  const mutations = useRoomReservationMutations();
  const { availability } = useRoomAvailability(room?.id ?? null);
  const [step, setStep] = useState<"info" | "form" | "confirmed">("info");

  // Form state
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");

  function resetForm() {
    setStep("info");
    setDate("");
    setStartHour(null);
    setEndHour(null);
    setPurpose("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
    setStartHour(null);
    setEndHour(null);
  }

  function handleStartHourChange(value: string) {
    setStartHour(Number(value));
    setEndHour(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room || !date || startHour == null || endHour == null || !user) return;

    try {
      await mutations.createRoomReservation({
        room_id: room.id,
        user_id: user.id,
        reservation_date: date,
        start_time: toTimeString(startHour),
        end_time: toTimeString(endHour),
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
  const today = new Date().toISOString().split("T")[0];
  const availableStartHours = getAvailableStartHours(availability, date);
  const availableEndHours = getAvailableEndHours(availability, startHour);

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
                <Label htmlFor="res-date" className="text-sm font-semibold">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="res-date"
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={startHour != null ? String(startHour) : ""}
                    onValueChange={handleStartHourChange}
                    disabled={!date}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStartHours.length === 0 ? (
                        <SelectItem value="__none__" disabled>No slots available</SelectItem>
                      ) : (
                        availableStartHours.map(h => (
                          <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={endHour != null ? String(endHour) : ""}
                    onValueChange={(v) => setEndHour(Number(v))}
                    disabled={startHour == null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEndHours.map(h => (
                        <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-purpose" className="text-sm font-semibold">
                  Purpose <span className="text-destructive">*</span>
                </Label>
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
                disabled={mutations.loading || !date || startHour == null || endHour == null || !purpose.trim()}
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
