"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { IconPlus, IconPencil, IconTrash, IconBox, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useEquipmentCategories,
  useEquipmentModels,
  useEquipmentUnits,
  useEquipmentMutations,
} from "@/hooks/useEquipment";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { EquipmentUnit } from "@/lib/db/types";

export function UnitsSection() {
  const { categories } = useEquipmentCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("__all__");
  const { models } = useEquipmentModels(selectedCategory === "__all__" ? undefined : selectedCategory);
  const [selectedModel, setSelectedModel] = useState<string>("__all__");
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const { units, loading, refetch } = useEquipmentUnits(selectedModel === "__all__" ? undefined : selectedModel, statusFilter === "__all__" ? undefined : statusFilter);
  const mutations = useEquipmentMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentUnit | null>(null);

  // Form state
  const [formCategoryId, setFormCategoryId] = useState("");
  const [modelId, setModelId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [condition, setCondition] = useState<string>("Good");
  const [status, setStatus] = useState<string>("available");
  const [notes, setNotes] = useState("");

  // Fetch models for the selected category in the form
  const { models: formModels } = useEquipmentModels(formCategoryId || undefined);

  function openAdd() {
    setEditing(null);
    setFormCategoryId("");
    setModelId(selectedModel === "__all__" ? "" : selectedModel);
    setUnitId(""); setCondition("Good"); setStatus("available"); setNotes("");
    setDialogOpen(true);
  }

  function openEdit(unit: EquipmentUnit) {
    setEditing(unit);
    const model = models.find(m => m.id === unit.modelId);
    setFormCategoryId(model?.categoryId || "");
    setModelId(unit.modelId);
    setUnitId(unit.unitId);
    setCondition(unit.condition);
    setStatus(unit.status);
    setNotes(unit.notes);
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = { modelId: modelId, unitId: unitId, condition, status, notes };
    try {
      if (editing) {
        await mutations.updateUnit(editing.id, { unitId: unitId, condition, status, notes });
        toast.success("Unit updated");
      } else {
        await mutations.createUnit(data);
        toast.success("Unit created");
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save unit");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await mutations.deleteUnit(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
      toast.success("Unit deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete unit");
    }
  }

  // Find model name helper
  const modelName = (id: string) => models.find((m) => m.id === id)?.modelName ?? "—";

  const filtered = units.filter((u) =>
    [u.unitId, modelName(u.modelId), u.notes].some((v) => v.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconBox className="size-4 text-muted-foreground" />
            Units
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{units.length}</Badge>
          </div>
          <Button size="sm" onClick={openAdd}>
            <IconPlus className="size-4" /> Add Unit
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input className="max-w-xs" placeholder="Search units..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedModel("__all__"); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.modelName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
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
                    <TableHead>Unit ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No units found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-mono text-sm font-semibold">{unit.unitId}</TableCell>
                      <TableCell className="text-sm">{modelName(unit.modelId)}</TableCell>
                      <TableCell><StatusBadge status={unit.condition} /></TableCell>
                      <TableCell><StatusBadge status={unit.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{unit.notes || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => openEdit(unit)}>
                            <IconPencil className="size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(unit)}>
                            <IconTrash className="size-3.5" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Unit" : "Add Unit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Category <span className="text-destructive">*</span></Label>
                  <Select value={formCategoryId} onValueChange={(val) => { setFormCategoryId(val); setModelId(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Model <span className="text-destructive">*</span></Label>
                  <Select value={modelId} onValueChange={setModelId} disabled={!formCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={formCategoryId ? "Select model" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.modelName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Unit ID <span className="text-destructive">*</span></Label>
              <Input placeholder='e.g. "CAM-A7IV-01"' value={unitId} onChange={(e) => setUnitId(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Condition <span className="text-destructive">*</span></Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status <span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on-loan">On Loan</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Notes</Label>
              <Input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={mutations.loading || !unitId.trim() || (!editing && (!formCategoryId || !modelId))}>
              {mutations.loading ? "Saving..." : editing ? "Save Changes" : "Add Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Unit"
        message={`Are you sure you want to delete unit "${deleteTarget?.unitId}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
