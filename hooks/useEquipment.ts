"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  EquipmentCategory,
  EquipmentModel,
  EquipmentUnit,
  EquipmentCategoryWithModels,
  EquipmentModelWithUnits,
} from "@/lib/db/types";

export type { EquipmentCategory, EquipmentModel, EquipmentUnit };

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function useEquipmentCategories() {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/equipment/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      setCategories(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, loading, error, refetch: fetch };
}

export function useEquipmentCategoriesWithModels() {
  const [categories, setCategories] = useState<EquipmentCategoryWithModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/equipment/categories?include=models");
      if (!res.ok) throw new Error("Failed to fetch categories with models");
      const json = await res.json();
      setCategories(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export function useEquipmentModels(categoryId?: string) {
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = categoryId
        ? `/api/equipment/models?category_id=${categoryId}`
        : "/api/equipment/models";
      const res = await window.fetch(url);
      if (!res.ok) throw new Error("Failed to fetch models");
      const json = await res.json();
      setModels(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { models, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export function useEquipmentUnits(modelId?: string, status?: string) {
  const [units, setUnits] = useState<EquipmentUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (modelId) params.set("model_id", modelId);
      if (status) params.set("status", status);
      const res = await window.fetch(`/api/equipment/units?${params}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const json = await res.json();
      setUnits(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [modelId, status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { units, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// Units with Model + Category joins (for admin inventory views)
// ---------------------------------------------------------------------------

export interface EquipmentUnitWithModelCategory extends EquipmentUnit {
  model: EquipmentModel & {
    category: EquipmentCategory;
  };
}

export function useEquipmentUnitsWithModel(status?: string) {
  const [units, setUnits] = useState<EquipmentUnitWithModelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ include: "model" });
      if (status) params.set("status", status);
      const res = await window.fetch(`/api/equipment/units?${params}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const json = await res.json();
      setUnits(Array.isArray(json) ? json : json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { units, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export function useEquipmentMutations() {
  const [loading, setLoading] = useState(false);

  // Categories
  async function createCategory(data: { name: string; emoji: string; description: string; color: string }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/equipment/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentCategory;
    } finally { setLoading(false); }
  }

  async function updateCategory(id: string, data: Partial<{ name: string; emoji: string; description: string; color: string }>) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentCategory;
    } finally { setLoading(false); }
  }

  async function deleteCategory(id: string) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
    } finally { setLoading(false); }
  }

  // Models
  async function createModel(data: { categoryId: string; modelName: string; description: string; imageUrl: string }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/equipment/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentModel;
    } finally { setLoading(false); }
  }

  async function updateModel(id: string, data: Partial<{ categoryId: string; modelName: string; description: string; imageUrl: string }>) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentModel;
    } finally { setLoading(false); }
  }

  async function deleteModel(id: string) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/models/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
    } finally { setLoading(false); }
  }

  // Units
  async function createUnit(data: { modelId: string; unitId: string; condition: string; status: string; notes: string }) {
    setLoading(true);
    try {
      const res = await window.fetch("/api/equipment/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentUnit;
    } finally { setLoading(false); }
  }

  async function updateUnit(id: string, data: Partial<{ unitId: string; condition: string; status: string; notes: string }>) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/units/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      return (await res.json()).data as EquipmentUnit;
    } finally { setLoading(false); }
  }

  async function deleteUnit(id: string) {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/equipment/units/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
    } finally { setLoading(false); }
  }

  return {
    loading,
    createCategory, updateCategory, deleteCategory,
    createModel, updateModel, deleteModel,
    createUnit, updateUnit, deleteUnit,
  };
}
