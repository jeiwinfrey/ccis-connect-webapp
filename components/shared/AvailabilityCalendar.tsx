"use client";

import { Fragment, useCallback } from "react";
import { cn } from "@/lib/utils";

const DAYS = [
  { short: "Sun", label: "Sunday", idx: 0 },
  { short: "Mon", label: "Monday", idx: 1 },
  { short: "Tue", label: "Tuesday", idx: 2 },
  { short: "Wed", label: "Wednesday", idx: 3 },
  { short: "Thu", label: "Thursday", idx: 4 },
  { short: "Fri", label: "Friday", idx: 5 },
  { short: "Sat", label: "Saturday", idx: 6 },
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM – 9 PM

export interface TimeSlot {
  day_of_week: number; // 0=Sunday … 6=Saturday
  start_hour: number;
  end_hour: number;
}

interface AvailabilityCalendarProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
}

function isSlotSelected(slots: TimeSlot[], day: number, hour: number): boolean {
  return slots.some(
    (s) => s.day_of_week === day && s.start_hour <= hour && s.end_hour > hour,
  );
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

function isDayFullySelected(slots: TimeSlot[], day: number): boolean {
  return HOURS.every((h) => isSlotSelected(slots, day, h));
}

function isDayPartiallySelected(slots: TimeSlot[], day: number): boolean {
  const some = HOURS.some((h) => isSlotSelected(slots, day, h));
  return some && !isDayFullySelected(slots, day);
}

function totalSelectedHours(slots: TimeSlot[]): number {
  return DAYS.reduce(
    (sum, day) => sum + HOURS.filter((h) => isSlotSelected(slots, day.idx, h)).length,
    0,
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
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
      const otherDays = selectedSlots.filter((s) => s.day_of_week !== day);
      const hours = new Set<number>();
      selectedSlots
        .filter((s) => s.day_of_week === day)
        .forEach((s) => {
          for (let h = s.start_hour; h < s.end_hour; h++) hours.add(h);
        });
      if (isSelected) hours.delete(hour);
      else hours.add(hour);
      onSlotsChange([...otherDays, ...buildContiguousSlots(day, hours)]);
    },
    [readOnly, selectedSlots, onSlotsChange],
  );

  const toggleDay = useCallback(
    (day: number) => {
      if (readOnly) return;
      const otherDays = selectedSlots.filter((s) => s.day_of_week !== day);
      if (isDayFullySelected(selectedSlots, day)) {
        onSlotsChange(otherDays);
      } else {
        onSlotsChange([...otherDays, ...buildContiguousSlots(day, new Set(HOURS))]);
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
        <div className="inline-grid grid-cols-[52px_repeat(7,minmax(56px,1fr))] min-w-[520px] w-full">
          {/* Column headers */}
          <div className="bg-muted/50 border-b border-border" />
          {DAYS.map((day) => {
            const full = isDayFullySelected(selectedSlots, day.idx);
            const partial = isDayPartiallySelected(selectedSlots, day.idx);
            const isWeekend = day.idx === 0 || day.idx === 6;
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
                  !full && isWeekend && "text-muted-foreground/60",
                  !full && !isWeekend && "text-foreground/70",
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

          {/* Hour rows */}
          {HOURS.map((hour, rowIdx) => {
            const isLast = rowIdx === HOURS.length - 1;
            return (
              <Fragment key={hour}>
                {/* Time label */}
                <div
                  className={cn(
                    "px-2 flex items-center justify-end text-[10px] font-medium text-muted-foreground whitespace-nowrap h-9",
                    !isLast && "border-b border-border",
                  )}
                >
                  {formatHour(hour)}
                </div>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const selected = isSlotSelected(selectedSlots, day.idx, hour);
                  return (
                    <button
                      key={day.idx}
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggleSlot(day.idx, hour)}
                      aria-label={`${day.label} ${formatHour(hour)}`}
                      aria-pressed={selected}
                      className={cn(
                        "border-l h-9 transition-colors",
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
