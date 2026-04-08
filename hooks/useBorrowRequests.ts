"use client";

import { useState, useEffect, useCallback } from "react";
import type { BorrowRequest, BorrowRequestWithDetails } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// List borrow requests
// ---------------------------------------------------------------------------

export function useBorrowRequests(status?: string, userId?: string) {
  const [requests, setRequests] = useState<BorrowRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (userId) params.set("user_id", userId);
      const res = await window.fetch(`/api/reservations/borrow?${params}`);
      if (!res.ok) throw new Error("Failed to fetch borrow requests");
      const json = await res.json();
      setRequests(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status, userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { requests, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useBorrowMutations() {
  const [loading, setLoading] = useState(false);

  async function createBorrowRequest(data: {
    userId: string;
    unitId: string;
    startDate: string;
    endDate: string;
    purpose: string;
  }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/reservations/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as BorrowRequest;
    } finally { setLoading(false); }
  }

  async function updateBorrowRequest(id: string, data: { status?: string; adminNotes?: string }) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/reservations/borrow/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as BorrowRequest;
    } finally { setLoading(false); }
  }

  return { loading, createBorrowRequest, updateBorrowRequest };
}
