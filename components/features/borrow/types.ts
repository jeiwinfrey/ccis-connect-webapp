"use client";

import type {
  EquipmentCategory,
  EquipmentModel,
  EquipmentUnit,
  EquipmentCategoryWithModels,
  BorrowRequestWithDetails,
} from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Re-export Supabase types used by borrow components
// ---------------------------------------------------------------------------

export type { EquipmentCategory, EquipmentModel, EquipmentUnit, BorrowRequestWithDetails };

// ---------------------------------------------------------------------------
// Mapped types for the borrow UI (derived from Supabase data)
// ---------------------------------------------------------------------------

/** A single physical unit displayed in the unit picker */
export interface Unit {
  id: string;          // Supabase uuid
  unitId: string;      // e.g. "CAM-A7IV-01"
  notes: string;
  condition: "Excellent" | "Good" | "Fair" | "Maintenance";
  status: "available" | "on-loan" | "maintenance";
  borrower?: string;
  dueBack?: string;
}

/** An equipment model card (aggregates its units) */
export interface EquipmentItem {
  id: string;            // Supabase uuid of the model
  model: string;         // model_name
  description: string;
  image: string;
  available: boolean;
  currentlyBorrowed: boolean;
  units: Unit[];
}

/** A category accordion section */
export interface Category {
  id: string;            // Supabase uuid
  name: string;
  emoji: string;
  description: string;
  color: string;
  items: EquipmentItem[];
}

/** User-facing borrow request (pending / rejected) */
export interface BorrowRequestUI {
  id: string;
  model: string;
  emoji: string;
  category: string;
  loanDuration: string;
  dates: string;
  submittedDate: string;
  rejectedDate?: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Condition color helper
// ---------------------------------------------------------------------------

export const conditionColor: Record<string, string> = {
  Excellent: "text-emerald-600",
  Good: "text-sky-600",
  Fair: "text-amber-500",
  Maintenance: "text-rose-500",
};

// ---------------------------------------------------------------------------
// Mapper: Supabase categories → UI categories
// ---------------------------------------------------------------------------

export function mapCategoriesToUI(
  categories: EquipmentCategoryWithModels[],
  borrowRequests: BorrowRequestWithDetails[] = [],
): Category[] {
  // Index accepted borrow requests by unit uuid for borrower info
  const borrowedByUnit = new Map<string, BorrowRequestWithDetails>();
  for (const req of borrowRequests) {
    if (req.status === "accepted") {
      borrowedByUnit.set(req.unitId, req);
    }
  }

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji,
    description: cat.description,
    color: cat.color,
    items: (cat.equipmentModels ?? []).map((model) => {
      const units: Unit[] = (model.equipmentUnits ?? []).map((u) => {
        const borrow = borrowedByUnit.get(u.id);
        return {
          id: u.id,
          unitId: u.unitId,
          notes: u.notes || "",
          condition: u.condition,
          status: u.status,
          borrower: borrow ? borrow.user?.name : undefined,
          dueBack: borrow ? borrow.endDate : undefined,
        };
      });

      const availableUnits = units.filter((u) => u.status === "available");
      const allOnLoan = units.length > 0 && availableUnits.length === 0;

      return {
        id: model.id,
        model: model.modelName,
        description: model.description,
        image: model.imageUrl || "/api/placeholder/300/200",
        available: availableUnits.length > 0,
        currentlyBorrowed: allOnLoan,
        units,
      };
    }),
  }));
}

// ---------------------------------------------------------------------------
// Mapper: Supabase borrow requests → UI borrow requests (pending / rejected)
// ---------------------------------------------------------------------------

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (s.getTime() === e.getTime()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

function dayDiff(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000));
}

export function mapBorrowRequestToUI(req: BorrowRequestWithDetails): BorrowRequestUI {
  const modelName =
    req.unit?.model?.modelName ?? "Unknown";
  const catEmoji = (req.unit?.model as any)
    ?.equipmentCategories?.emoji ?? "📦";
  const catName = (req.unit?.model as any)
    ?.equipmentCategories?.name ?? "Equipment";
  const days = dayDiff(req.startDate, req.endDate);

  return {
    id: req.id,
    model: modelName,
    emoji: catEmoji,
    category: catName,
    loanDuration: `${days}-day loan`,
    dates: formatDateRange(req.startDate, req.endDate),
    submittedDate: new Date(req.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rejectedDate: req.status === "rejected"
      ? new Date(req.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : undefined,
    reason: req.adminNotes ?? undefined,
  };
}
