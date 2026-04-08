// Equipment Constants

export const EQUIPMENT_CONDITIONS = ["Excellent", "Good", "Fair", "Maintenance"] as const;
export type EquipmentCondition = typeof EQUIPMENT_CONDITIONS[number];

export const EQUIPMENT_STATUSES = ["available", "on-loan", "maintenance"] as const;
export type EquipmentStatus = typeof EQUIPMENT_STATUSES[number];

export const CONDITION_COLORS: Record<EquipmentCondition, string> = {
  Excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Good: "text-sky-600 bg-sky-50 border-sky-200",
  Fair: "text-amber-600 bg-amber-50 border-amber-200",
  Maintenance: "text-rose-600 bg-rose-50 border-rose-200",
};

export const STATUS_COLORS: Record<EquipmentStatus, string> = {
  available: "text-emerald-600 bg-emerald-50 border-emerald-200",
  "on-loan": "text-amber-600 bg-amber-50 border-amber-200",
  maintenance: "text-rose-600 bg-rose-50 border-rose-200",
};

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: "Available",
  "on-loan": "On Loan",
  maintenance: "Maintenance",
};
