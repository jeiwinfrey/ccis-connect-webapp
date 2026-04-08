"use client";

import { Fragment, useCallback } from "react";
import { cn } from "@/lib/utils";

const DAYS = [
  { short: "Mon", label: "Monday", idx: 1 },
  { short: "Tue", label: "Tuesday", idx: 2 },
  { short: "Wed", label: "Wednesday", idx: 3 },
  { short: "Thu", label: "Thursday", idx: 4 },
  { short: "Fri", label: "Friday", idx: 5 },
];

// Time slots from 7:30 AM to 5:00 PM in 30-minute increments
// Represented as minutes from midnight (7:30 AM = 450, 5:00 PM = 1020)
const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => 450 + i * 30); // 7:30 AM – 4:30 PM (19 slots, ending at 5:00 PM)

export interface TimeSlot {
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  startHour: number;
  endHour: number;
}

interface AvailabilityCalendarProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
}

function isSlotSelected(slots: TimeSlot[], day: number, minutes: number): boolean {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return slots.some((s) => {
    const slotStart = s.startHour * 60;
    const slotEnd = s.endHour * 60;
    const currentTime = hour * 60 + minute;
    return s.dayOfWeek === day && currentTime >= slotStart && currentTime < slotEnd;
  });
}

function buildContiguousSlots(day: number, minuteSlots: Set<number>): TimeSlot[] {
  if (minuteSlots.size === 0) return [];
  const sorted = Array.from(minuteSlots).sort((a, b) => a - b);
  const slots: TimeSlot[] = [];
  let start = sorted[0];
  let end = sorted[0] + 30;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end) {
      end += 30;
    } else {
      slots.push({ 
        dayOfWeek: day, 
        startHour: Math.floor(start / 60) + (start % 60) / 60, 
        endHour: Math.floor(end / 60) + (end % 60) / 60 
      });
      start = sorted[i];
      end = sorted[i] + 30;
    }
  }
  slots.push({ 
    dayOfWeek: day, 
    startHour: Math.floor(start / 60) + (start % 60) / 60, 
    endHour: Math.floor(end / 60) + (end % 60) / 60 
  });
  return slots;
}

function isDayFullySelected(slots: TimeSlot[], day: number): boolean {
  return TIME_SLOTS.every((m) => isSlotSelected(slots, day, m));
}

function isDayPartiallySelected(slots: TimeSlot[], day: number): boolean {
  const some = TIME_SLOTS.some((m) => isSlotSelected(slots, day, m));
  return some && !isDayFullySelected(slots, day);
}

function totalSelectedHours(slots: TimeSlot[]): number {
  const totalSlots = DAYS.reduce(
    (sum, day) => sum + TIME_SLOTS.filter((m) => isSlotSelected(slots, day.idx, m)).length,
    0,
  );
  return totalSlots * 0.5; // Each slot is 30 minutes = 0.5 hours
}

function formatTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
}

function formatTimeRange(minutes: number): string {
  const startTime = formatTime(minutes);
  const endTime = formatTime(minutes + 30);
  return `${startTime}-${endTime}`;
}

export function AvailabilityCalendar({
  selectedSlots,
  onSlotsChange,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const toggleSlot = useCallback(
    (day: number, minutes: number) => {
      if (readOnly) return;
      const isSelected = isSlotSelected(selectedSlots, day, minutes);
      const otherDays = selectedSlots.filter((s) => s.dayOfWeek !== day);
      const minuteSlots = new Set<number>();
      selectedSlots
        .filter((s) => s.dayOfWeek === day)
        .forEach((s) => {
          const startMinutes = Math.floor(s.startHour * 60);
          const endMinutes = Math.floor(s.endHour * 60);
          for (let m = startMinutes; m < endMinutes; m += 30) {
            minuteSlots.add(m);
          }
        });
      if (isSelected) minuteSlots.delete(minutes);
      else minuteSlots.add(minutes);
      onSlotsChange([...otherDays, ...buildContiguousSlots(day, minuteSlots)]);
    },
    [readOnly, selectedSlots, onSlotsChange],
  );

  const toggleDay = useCallback(
    (day: number) => {
      if (readOnly) return;
      const otherDays = selectedSlots.filter((s) => s.dayOfWeek !== day);
      if (isDayFullySelected(selectedSlots, day)) {
        onSlotsChange(otherDays);
      } else {
        onSlotsChange([...otherDays, ...buildContiguousSlots(day, new Set(TIME_SLOTS))]);
      }
    },
    [readOnly, selectedSlots, onSlotsChange],
  );

  const clearAll = useCallback(() => {
    if (!readOnly) onSlotsChange([]);
  }, [readOnly, onSlotsChange]);

  const total = totalSelectedHours(selectedSlots);

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center justify-between min-h-[20px]">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? (
            "No time slots selected — this room will appear unavailable."
          ) : (
            <>
              <span className="font-semibold text-foreground">{total}</span>
              {" hr"}{total !== 1 ? "s" : ""} / week available
            </>
          )}
        </p>
        {!readOnly && total > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="inline-grid grid-cols-[100px_repeat(5,minmax(56px,1fr))] min-w-[420px] w-full">
          {/* Column headers */}
          <div className="bg-muted/50 border-b border-border" />
          {DAYS.map((day) => {
            const full = isDayFullySelected(selectedSlots, day.idx);
            const partial = isDayPartiallySelected(selectedSlots, day.idx);
            return (
              <button
                key={day.idx}
                type="button"
                disabled={readOnly}
                onClick={() => toggleDay(day.idx)}
                title={full ? `Clear ${day.label}` : `Select all ${day.label}`}
                className={cn(
                  "border-b border-l border-border py-2.5 text-[11px] font-semibold text-center transition-colors select-none",
                  "bg-muted/50",
                  !readOnly && "hover:bg-muted cursor-pointer",
                  readOnly && "cursor-default",
                  full && "bg-primary/15 text-primary",
                  !full && "text-foreground/70",
                )}
              >
                {day.short}
                <div className="flex justify-center mt-1">
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full transition-colors",
                      full && "bg-primary",
                      partial && "bg-primary/40",
                      !full && !partial && "bg-transparent",
                    )}
                  />
                </div>
              </button>
            );
          })}

          {/* Time slot rows */}
          {TIME_SLOTS.map((minutes, rowIdx) => {
            const isLast = rowIdx === TIME_SLOTS.length - 1;
            return (
              <Fragment key={minutes}>
                {/* Time label */}
                <div
                  className={cn(
                    "px-2 flex items-center justify-end text-[9px] font-medium text-muted-foreground whitespace-nowrap h-7",
                    !isLast && "border-b border-border",
                  )}
                >
                  {formatTimeRange(minutes)}
                </div>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const selected = isSlotSelected(selectedSlots, day.idx, minutes);
                  return (
                    <button
                      key={day.idx}
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggleSlot(day.idx, minutes)}
                      aria-label={`${day.label} ${formatTimeRange(minutes)}`}
                      aria-pressed={selected}
                      className={cn(
                        "border-l h-7 transition-colors",
                        !isLast && "border-b border-border",
                        selected
                          ? "bg-primary/70 hover:bg-primary/85"
                          : "bg-card hover:bg-primary/10",
                        readOnly ? "cursor-default" : "cursor-pointer",
                      )}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-primary/70" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm border border-border bg-card" />
          <span>Unavailable</span>
        </div>
        {!readOnly && (
          <span className="ml-auto text-[10px]">Click a column header to toggle the entire day</span>
        )}
      </div>
    </div>
  );
}
