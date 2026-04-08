"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, ActivityLog } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/admin/users?role=admin,super_admin");
      if (!res.ok) throw new Error("Failed to fetch admin users");
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// All users
// ---------------------------------------------------------------------------

export function useUsers(role?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = role ? `?role=${role}` : "";
      const res = await window.fetch(`/api/admin/users${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export function useActivityLog(limit?: number) {
  const [logs, setLogs] = useState<(ActivityLog & { users?: User | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = limit ? `?limit=${limit}` : "";
      const res = await window.fetch(`/api/admin/activity${params}`);
      if (!res.ok) throw new Error("Failed to fetch activity log");
      const json = await res.json();
      setLogs(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Admin mutations
// ---------------------------------------------------------------------------

export function useAdminMutations() {
  const [loading, setLoading] = useState(false);

  async function createUser(data: { name: string; email: string; role: string; department: string; studentId?: string }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as User;
    } finally { setLoading(false); }
  }

  async function updateUser(id: string, data: Partial<{ name: string; role: string; department: string }>) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as User;
    } finally { setLoading(false); }
  }

  async function deleteUser(id: string) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
    } finally { setLoading(false); }
  }

  return { loading, createUser, updateUser, deleteUser };
}
