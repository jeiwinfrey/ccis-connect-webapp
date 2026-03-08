"use client";

import type { Room as SupabaseRoom, RoomReservationWithDetails } from "@/lib/supabase/types";

// Re-export Supabase Room type
export type { SupabaseRoom };

// ---------------------------------------------------------------------------
// UI Room type (extends Supabase Room with occupancy status)
// ---------------------------------------------------------------------------

export interface Room {
  id: string;             // Supabase uuid
  room_number: string;    // e.g. "R101"
  name: string;
  type: string;
  capacity: string;
  floor: string;
  status: "vacant" | "occupied";
}

// ---------------------------------------------------------------------------
// Mapper: Supabase rooms + active reservations → UI rooms
// ---------------------------------------------------------------------------

export function mapRoomsToUI(
  rooms: SupabaseRoom[],
  activeReservations: RoomReservationWithDetails[] = [],
): Room[] {
  // Build a set of room_ids that currently have an active (accepted) reservation
  const now = new Date();
  const occupiedRoomIds = new Set<string>();

  for (const res of activeReservations) {
    if (res.status !== "accepted") continue;

    // Check if the reservation is currently active
    const resDate = new Date(res.reservation_date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reservationDay = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate());

    if (reservationDay.getTime() === today.getTime()) {
      // Check time overlap with current time
      const [startH, startM] = res.start_time.split(":").map(Number);
      const [endH, endM] = res.end_time.split(":").map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        occupiedRoomIds.add(res.room_id);
      }
    }
  }

  return rooms.map((room) => ({
    id: room.id,
    room_number: room.room_number,
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    floor: room.floor,
    status: occupiedRoomIds.has(room.id) ? "occupied" : "vacant",
  }));
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
