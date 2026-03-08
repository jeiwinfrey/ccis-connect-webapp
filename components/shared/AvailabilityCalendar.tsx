"use client";

import { useCallback } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM - 9 PM

export interface TimeSlot {
  day_of_week: number; // 0=Sunday ... 6=Saturday
  start_hour: number;
  end_hour: number;
}

interface AvailabilityCalendarProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  /** Read-only mode for display */
  readOnly?: boolean;
}

function slotKey(day: number, hour: number) {
  return `${day}-${hour}`;
}

function isSlotSelected(slots: TimeSlot[], day: number, hour: number): boolean {
  return slots.some(
    (s) => s.day_of_week === day && s.start_hour <= hour && s.end_hour > hour,
  );
}

export function AvailabilityCalendar({
  selectedSlots,
  onSlotsChange,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const toggleSlot = useCallback(
    (day: number, hour: number) => {
      if (readOnly) return;

      const isSelected = isSlotSelected(selectedSlots, day, hour);

      if (isSelected) {
        // Remove this hour — we rebuild the slots for this day excluding this hour
        const otherDays = selectedSlots.filter((s) => s.day_of_week !== day);
        const thisDay = selectedSlots.filter((s) => s.day_of_week === day);

        // Get all individual hours for this day, then remove the toggled one
        const hours = new Set<number>();
        thisDay.forEach((s) => {
          for (let h = s.start_hour; h < s.end_hour; h++) hours.add(h);
        });
        hours.delete(hour);

        // Rebuild contiguous ranges
        const newSlots = buildContiguousSlots(day, hours);
        onSlotsChange([...otherDays, ...newSlots]);
      } else {
        // Add this hour
        const otherDays = selectedSlots.filter((s) => s.day_of_week !== day);
        const thisDay = selectedSlots.filter((s) => s.day_of_week === day);

        const hours = new Set<number>();
        thisDay.forEach((s) => {
          for (let h = s.start_hour; h < s.end_hour; h++) hours.add(h);
        });
        hours.add(hour);

        const newSlots = buildContiguousSlots(day, hours);
        onSlotsChange([...otherDays, ...newSlots]);
      }
    },
    [readOnly, selectedSlots, onSlotsChange],
  );

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid grid-cols-[auto_repeat(7,1fr)] gap-px bg-border rounded-lg overflow-hidden min-w-[500px]">
        {/* Header row */}
        <div className="bg-muted/50 p-2 text-xs font-medium text-muted-foreground text-center">
          Time
        </div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-muted/50 p-2 text-xs font-medium text-muted-foreground text-center"
          >
            {day}
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <>
            <div
              key={`label-${hour}`}
              className="bg-card p-2 text-xs text-muted-foreground text-right pr-3 whitespace-nowrap"
            >
              {formatHour(hour)}
            </div>
            {DAYS.map((_, dayIdx) => {
              const selected = isSlotSelected(selectedSlots, dayIdx, hour);
              return (
                <button
                  key={slotKey(dayIdx, hour)}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleSlot(dayIdx, hour)}
                  className={`p-2 transition-colors text-xs ${
                    selected
                      ? "bg-primary/20 text-primary font-medium"
                      : "bg-card hover:bg-muted/80"
                  } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                >
                  {selected ? "●" : ""}
                </button>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function buildContiguousSlots(day: number, hours: Set<number>): TimeSlot[] {
  if (hours.size === 0) return [];
  const sorted = Array.from(hours).sort((a, b) => a - b);
  const slots: TimeSlot[] = [];
  let start = sorted[0];
  let end = sorted[0] + 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end) {
      end++;
    } else {
      slots.push({ day_of_week: day, start_hour: start, end_hour: end });
      start = sorted[i];
      end = sorted[i] + 1;
    }
  }
  slots.push({ day_of_week: day, start_hour: start, end_hour: end });
  return slots;
}
