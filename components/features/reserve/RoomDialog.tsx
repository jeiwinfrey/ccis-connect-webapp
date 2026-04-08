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
import type { RoomAvailability } from "@/lib/db/types";

interface RoomDialogProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onReservationComplete?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function getNextDateForDay(dayOfWeek: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  let daysToAdd = dayOfWeek - currentDay;
  if (daysToAdd <= 0) daysToAdd += 7; // Get next occurrence
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  return targetDate.toISOString().split("T")[0];
}

function getAvailableTimeSlots(availability: RoomAvailability[], dayOfWeek: number): number[] {
  const slots: number[] = [];
  for (const slot of availability) {
    if (slot.dayOfWeek !== dayOfWeek) continue;
    // Generate 30-minute slots
    let current = slot.startHour;
    while (current < slot.endHour) {
      slots.push(current);
      current += 0.5;
    }
  }
  return slots.sort((a, b) => a - b);
}

function getAvailableEndTimes(availability: RoomAvailability[], dayOfWeek: number, startTime: number | null): number[] {
  if (startTime == null) return [];
  const slot = availability.find(s => s.dayOfWeek === dayOfWeek && s.startHour <= startTime && s.endHour > startTime);
  if (!slot) return [];
  const times: number[] = [];
  let current = startTime + 0.5;
  while (current <= slot.endHour) {
    times.push(current);
    current += 0.5;
  }
  return times;
}

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}:00 ${ampm}` : `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function toTimeString(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function RoomDialog({ room, open, onClose, onReservationComplete }: RoomDialogProps) {
  const { user } = useAuth();
  const mutations = useRoomReservationMutations();
  const { availability } = useRoomAvailability(room?.id ?? null);
  const [step, setStep] = useState<"info" | "form" | "confirmed">("info");

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");

  function resetForm() {
    setStep("info");
    setDayOfWeek(null);
    setStartTime(null);
    setEndTime(null);
    setPurpose("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleDayChange(value: string) {
    setDayOfWeek(Number(value));
    setStartTime(null);
    setEndTime(null);
  }

  function handleStartTimeChange(value: string) {
    const time = Number(value);
    setStartTime(time);
    setEndTime(time + 0.5); // Auto-select next 30-min slot as default
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room || dayOfWeek == null || startTime == null || endTime == null || !user) return;

    const reservationDate = getNextDateForDay(dayOfWeek);

    try {
      await mutations.createRoomReservation({
        roomId: room.id,
        userId: user.id,
        reservationDate,
        startTime: toTimeString(startTime),
        endTime: toTimeString(endTime),
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
  const currentDay = new Date().getDay();
  const availableStartTimes = dayOfWeek != null ? getAvailableTimeSlots(availability, dayOfWeek) : [];
  const availableEndTimes = dayOfWeek != null && startTime != null ? getAvailableEndTimes(availability, dayOfWeek, startTime) : [];

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
                Your reservation for <span className="font-semibold">{room.name} ({room.roomNumber})</span> has been submitted for review.
              </p>
            </div>
            <Button className="w-full" onClick={handleDone}>
              Done
            </Button>
          </div>
        ) : step === "form" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
              <p className="text-xs font-semibold text-primary">{room.roomNumber} &middot; {room.floor}</p>
              <DialogTitle className="text-xl">Reserve {room.name}</DialogTitle>
              <DialogDescription className="sr-only">Fill in details to reserve this room.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Show logged-in user info (read-only) */}
              {user && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.studentId || user.username} &middot; {user.department}
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="res-day" className="text-sm font-semibold">
                  Day <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={dayOfWeek != null ? String(dayOfWeek) : ""}
                  onValueChange={handleDayChange}
                >
                  <SelectTrigger id="res-day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem 
                        key={day.value} 
                        value={String(day.value)}
                        disabled={day.value === currentDay}
                      >
                        {day.label} {day.value === currentDay && "(Today - Not Available)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={startTime != null ? String(startTime) : ""}
                    onValueChange={handleStartTimeChange}
                    disabled={dayOfWeek == null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStartTimes.length === 0 ? (
                        <SelectItem value="__none__" disabled>No slots available</SelectItem>
                      ) : (
                        availableStartTimes.map(time => (
                          <SelectItem key={time} value={String(time)}>{formatTime(time)}</SelectItem>
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
                    value={endTime != null ? String(endTime) : ""}
                    onValueChange={(v) => setEndTime(Number(v))}
                    disabled={startTime == null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEndTimes.map(time => (
                        <SelectItem key={time} value={String(time)}>{formatTime(time)}</SelectItem>
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
                disabled={mutations.loading || dayOfWeek == null || startTime == null || endTime == null || !purpose.trim()}
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
              <p className="text-xs font-semibold text-primary">{room.roomNumber} &middot; {room.floor}</p>
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
                { label: "Room ID", value: room.roomNumber },
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
