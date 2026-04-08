"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { IconCircleDotted, IconLoader2 } from "@tabler/icons-react";
import { useEquipmentUnitsWithModel, useEquipmentCategories } from "@/hooks/useEquipment";

const conditionBadge: Record<string, string> = {
  Excellent: "text-emerald-600 border-emerald-300 bg-emerald-50",
  Good: "text-blue-600 border-blue-300 bg-blue-50",
  Fair: "text-amber-600 border-amber-300 bg-amber-50",
  Maintenance: "text-red-600 border-red-300 bg-red-50",
};

export default function EquipmentAvailable() {
  const { units, loading } = useEquipmentUnitsWithModel("available");
  const { categories } = useEquipmentCategories();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = units.filter(row => {
    const modelName = row.equipmentModels?.modelName ?? "";
    const matchSearch = [modelName, row.unitId, row.notes]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || row.equipmentModels?.equipmentCategories?.id === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipment Inventory — Available</h1>
        <p className="text-sm text-muted-foreground">Equipment units ready for borrowing.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconCircleDotted className="size-4 text-emerald-600" />
            Available Units
            <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 rounded-full px-2 py-0.5 text-xs">{filtered.length}</Badge>
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
                        No available equipment found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold text-sm">{row.equipmentModels?.modelName ?? "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{row.unitId}</TableCell>
                      <TableCell className="text-sm">{row.equipmentModels?.equipmentCategories?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${conditionBadge[row.condition] ?? ""}`}>
                          {row.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.notes || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 text-xs">
                          Available
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
