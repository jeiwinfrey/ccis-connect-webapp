"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { IconPackage, IconLoader2 } from "@tabler/icons-react";
import { useEquipmentUnitsWithModel } from "@/hooks/useEquipment";
import { useEquipmentCategories } from "@/hooks/useEquipment";

const statusBadge: Record<string, string> = {
  available: "text-emerald-600 border-emerald-300 bg-emerald-50",
  "on-loan": "text-orange-600 border-orange-300 bg-orange-50",
  maintenance: "text-red-600 border-red-300 bg-red-50",
};

const statusLabel: Record<string, string> = {
  available: "Available",
  "on-loan": "On Loan",
  maintenance: "Maintenance",
};

const conditionBadge: Record<string, string> = {
  Excellent: "text-emerald-600 border-emerald-300 bg-emerald-50",
  Good: "text-blue-600 border-blue-300 bg-blue-50",
  Fair: "text-amber-600 border-amber-300 bg-amber-50",
  Maintenance: "text-red-600 border-red-300 bg-red-50",
};

export default function EquipmentAll() {
  const { units, loading } = useEquipmentUnitsWithModel();
  const { categories } = useEquipmentCategories();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = units.filter(row => {
    const modelName = row.model?.modelName ?? "";
    const categoryName = row.model?.category?.name ?? "";
    const matchSearch = [modelName, categoryName, row.unitId, row.notes]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || row.model?.category?.id === category;
    const matchStatus = status === "all" || row.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const availableCount = units.filter(r => r.status === "available").length;
  const onLoanCount = units.filter(r => r.status === "on-loan").length;
  const maintenanceCount = units.filter(r => r.status === "maintenance").length;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipment Inventory — All Units</h1>
        <p className="text-sm text-muted-foreground">Complete inventory of all equipment units.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 text-emerald-600 bg-emerald-50">
            <IconPackage className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 text-orange-600 bg-orange-50">
            <IconPackage className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{onLoanCount}</p>
            <p className="text-xs text-muted-foreground">On Loan</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 text-red-600 bg-red-50">
            <IconPackage className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{maintenanceCount}</p>
            <p className="text-xs text-muted-foreground">Maintenance</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            All Equipment
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{units.length} units</Badge>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input
              className="max-w-xs"
              placeholder="Search equipment, unit ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-loan">On Loan</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Unit ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No equipment found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold text-sm">{row.model?.modelName ?? "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{row.unitId}</TableCell>
                      <TableCell className="text-sm">{row.model?.category?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${conditionBadge[row.condition] ?? ""}`}>
                          {row.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.notes || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusBadge[row.status] ?? ""}`}>
                          {statusLabel[row.status] ?? row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
