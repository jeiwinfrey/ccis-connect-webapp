"use client";

import type { Room as SupabaseRoom, RoomAvailability, RoomReservationWithDetails } from "@/lib/db/types";

// Re-export Supabase Room type
export type { SupabaseRoom };

// ---------------------------------------------------------------------------
// UI Room type (extends Supabase Room with occupancy status)
// ---------------------------------------------------------------------------

export interface Room {
  id: string;             // Supabase uuid
  roomNumber: string;    // e.g. "R101"
  name: string;
  type: string;
  capacity: string;
  floor: string;
  notes: string;
  status: "vacant" | "occupied";
}

// ---------------------------------------------------------------------------
// Mapper: Supabase rooms + active reservations → UI rooms
// ---------------------------------------------------------------------------

export interface TimeFilter {
  dayOfWeek: number;   // 0=Sunday ... 6=Saturday
  startHour: number;   // decimal hours, e.g. 8.5 = 8:30 AM
  endHour: number;     // decimal hours, e.g. 10 = 10:00 AM
  date: string;        // YYYY-MM-DD for reservation conflict check
}

export function mapRoomsToUI(
  rooms: SupabaseRoom[],
  activeReservations: RoomReservationWithDetails[] = [],
  availabilityMap: Record<string, RoomAvailability[]> = {},
  timeFilter?: TimeFilter,
): Room[] {
  const now = new Date();
  const day = timeFilter?.dayOfWeek ?? now.getDay();
  const startH = timeFilter?.startHour ?? (now.getHours() + now.getMinutes() / 60);
  const endH = timeFilter?.endHour ?? (startH + 0.5);
  const filterDate = timeFilter?.date ?? now.toISOString().slice(0, 10);

  const occupiedRoomIds = new Set<string>();

  for (const res of activeReservations) {
    if (res.status !== "accepted") continue;

    const resDate = typeof res.reservationDate === "string"
      ? res.reservationDate.slice(0, 10)
      : new Date(res.reservationDate).toISOString().slice(0, 10);

    if (resDate === filterDate) {
      const [rStartH, rStartM] = res.startTime.split(":").map(Number);
      const [rEndH, rEndM] = res.endTime.split(":").map(Number);
      const resStart = rStartH + (rStartM || 0) / 60;
      const resEnd = rEndH + (rEndM || 0) / 60;

      // Overlap check: reservation overlaps if it starts before our end AND ends after our start
      if (resStart < endH && resEnd > startH) {
        occupiedRoomIds.add(res.roomId);
      }
    }
  }

  return rooms.map((room) => {
    const slots = availabilityMap[room.id] ?? [];
    // Room is scheduled if any slot on this day covers the entire requested range
    const isScheduled = slots.some(
      (s) => s.dayOfWeek === day && s.startHour <= startH && s.endHour >= endH,
    );

    let status: "vacant" | "occupied";
    if (!isScheduled) {
      status = "occupied";
    } else if (occupiedRoomIds.has(room.id)) {
      status = "occupied";
    } else {
      status = "vacant";
    }

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      floor: room.floor,
      notes: room.notes ?? "",
      status,
    };
  });
}

// ---------------------------------------------------------------------------
// Split rooms into top/bottom rows for the floor map
// ---------------------------------------------------------------------------

export function splitRooms(rooms: Room[]): { topRooms: Room[]; bottomRooms: Room[] } {
  const half = Math.ceil(rooms.length / 2);
  return {
    topRooms: rooms.slice(0, half),
    bottomRooms: rooms.slice(half),
  };
}
