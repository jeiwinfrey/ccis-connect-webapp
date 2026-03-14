"use client";

import { useState, useEffect, useCallback } from "react";
import { useRealtimeSubscription } from "./useRealtime";
import type { Room, RoomAvailability } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Rooms list
// ---------------------------------------------------------------------------

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const json = await res.json();
      setRooms(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useRealtimeSubscription("rooms", fetch);

  return { rooms, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Room availability
// ---------------------------------------------------------------------------

export function useRoomAvailability(roomId: string | null) {
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!roomId) { setAvailability([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch(`/api/rooms/${roomId}/availability`);
      if (!res.ok) throw new Error("Failed to fetch availability");
      const json = await res.json();
      setAvailability(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetch(); }, [fetch]);
  useRealtimeSubscription("room_availability", fetch, !!roomId);

  return { availability, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Available rooms for a time slot
// ---------------------------------------------------------------------------

export function useAvailableRooms(date?: string, startTime?: string, endTime?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!date || !startTime || !endTime) { setRooms([]); return; }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ date, start_time: startTime, end_time: endTime });
      const res = await window.fetch(`/api/rooms/available?${params}`);
      if (!res.ok) throw new Error("Failed to fetch available rooms");
      const json = await res.json();
      setRooms(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [date, startTime, endTime]);

  useEffect(() => { fetch(); }, [fetch]);
  useRealtimeSubscription("room_reservations", fetch, !!(date && startTime && endTime));

  return { rooms, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Room CRUD mutations
// ---------------------------------------------------------------------------

export function useRoomMutations() {
  const [loading, setLoading] = useState(false);

  async function createRoom(data: { room_number: string; name: string; type: string; capacity: string; floor: string }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as Room;
    } finally { setLoading(false); }
  }

  async function updateRoom(id: string, data: Partial<{ room_number: string; name: string; type: string; capacity: string; floor: string }>) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as Room;
    } finally { setLoading(false); }
  }

  async function deleteRoom(id: string) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
    } finally { setLoading(false); }
  }

  async function setAvailability(roomId: string, slots: { day_of_week: number; start_hour: number; end_hour: number }[]) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/rooms/${roomId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: slots }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as RoomAvailability[];
    } finally { setLoading(false); }
  }

  return { loading, createRoom, updateRoom, deleteRoom, setAvailability };
}
