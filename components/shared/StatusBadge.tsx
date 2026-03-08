"use client";

import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  // Borrow / Room request statuses
  pending: "text-amber-600 border-amber-300 bg-amber-50",
  accepted: "text-emerald-600 border-emerald-300 bg-emerald-50",
  rejected: "text-red-600 border-red-300 bg-red-50",
  returned: "text-blue-600 border-blue-300 bg-blue-50",

  // Equipment unit statuses
  available: "text-emerald-600 border-emerald-300 bg-emerald-50",
  "on-loan": "text-orange-600 border-orange-300 bg-orange-50",
  maintenance: "text-red-600 border-red-300 bg-red-50",

  // Equipment condition
  Excellent: "text-emerald-600 border-emerald-300 bg-emerald-50",
  Good: "text-blue-600 border-blue-300 bg-blue-50",
  Fair: "text-amber-600 border-amber-300 bg-amber-50",
  Maintenance: "text-red-600 border-red-300 bg-red-50",

  // Admin roles
  admin: "text-blue-600 border-blue-300 bg-blue-50",
  super_admin: "text-violet-600 border-violet-300 bg-violet-50",
  "Super Admin": "text-violet-600 border-violet-300 bg-violet-50",
  Admin: "text-blue-600 border-blue-300 bg-blue-50",

  // Generic
  active: "text-emerald-600 border-emerald-300 bg-emerald-50",
  inactive: "text-muted-foreground border-border bg-muted",
};

const labelOverrides: Record<string, string> = {
  "on-loan": "On Loan",
  super_admin: "Super Admin",
};

interface StatusBadgeProps {
  status: string;
  /** Override the display label (otherwise capitalised status is shown) */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const display =
    label ??
    labelOverrides[status] ??
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={`text-xs ${statusStyles[status] ?? "text-muted-foreground border-border bg-muted"} ${className ?? ""}`}
    >
      {display}
    </Badge>
  );
}
