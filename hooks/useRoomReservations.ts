"use client";

import { useState, useEffect, useCallback } from "react";
import type { RoomReservation, RoomReservationWithDetails } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// List room reservations
// ---------------------------------------------------------------------------

export function useRoomReservations(status?: string, userId?: string) {
  const [reservations, setReservations] = useState<RoomReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (userId) params.set("user_id", userId);
      const res = await window.fetch(`/api/reservations/room?${params}`);
      if (!res.ok) throw new Error("Failed to fetch room reservations");
      const json = await res.json();
      setReservations(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status, userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reservations, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useRoomReservationMutations() {
  const [loading, setLoading] = useState(false);

  async function createRoomReservation(data: {
    roomId: string;
    userId: string;
    reservationDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/reservations/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as RoomReservation;
    } finally { setLoading(false); }
  }

  async function updateRoomReservation(id: string, data: { status?: string; adminNotes?: string }) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/reservations/room/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as RoomReservation;
    } finally { setLoading(false); }
  }

  return { loading, createRoomReservation, updateRoomReservation };
}
