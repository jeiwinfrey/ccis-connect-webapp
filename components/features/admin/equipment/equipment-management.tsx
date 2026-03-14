"use client";

import { useState, useEffect } from "react";
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
import {
  IconPlus, IconPencil, IconTrash, IconCategory, IconDevices, IconBox,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useEquipmentCategories,
  useEquipmentModels,
  useEquipmentUnits,
  useEquipmentMutations,
} from "@/hooks/useEquipment";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { EquipmentCategory, EquipmentModel, EquipmentUnit } from "@/lib/supabase/types";

type Tab = "categories" | "models" | "units";

export default function EquipmentManagement() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, or remove equipment categories, models, and units.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "categories" as Tab, label: "Categories", icon: IconCategory },
          { key: "models" as Tab, label: "Models", icon: IconDevices },
          { key: "units" as Tab, label: "Units", icon: IconBox },
        ]).map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
          >
            <t.icon className="size-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "categories" && <CategoriesSection />}
      {tab === "models" && <ModelsSection />}
      {tab === "units" && <UnitsSection />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Categories Section
// ---------------------------------------------------------------------------

function CategoriesSection() {
  const { categories, loading, refetch } = useEquipmentCategories();
  const mutations = useEquipmentMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentCategory | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");

  function openAdd() {
    setEditing(null);
    setName(""); setEmoji(""); setDescription(""); setColor("");
    setDialogOpen(true);
  }

  function openEdit(cat: EquipmentCategory) {
    setEditing(cat);
    setName(cat.name); setEmoji(cat.emoji); setDescription(cat.description); setColor(cat.color);
    setDialogOpen(true);
  }

  const categoryFormValid = name.trim() && emoji.trim() && description.trim() && color.trim();

  async function handleSave() {
    if (!categoryFormValid) return;
    const data = { name: name.trim(), emoji: emoji.trim(), description: description.trim(), color: color.trim() };
    try {
      if (editing) {
        await mutations.updateCategory(editing.id, data);
        toast.success("Category updated");
      } else {
        await mutations.createCategory(data);
        toast.success("Category created");
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save category");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await mutations.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
      toast.success("Category deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete category");
    }
  }

  const filtered = categories.filter((c) =>
    [c.name, c.description].some((v) => v.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconCategory className="size-4 text-muted-foreground" />
            Categories
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
              {categories.length}
            </Badge>
          </div>
          <Button size="sm" onClick={openAdd}>
            <IconPlus className="size-4" /> Add Category
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <Input className="max-w-xs" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emoji</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="text-lg">{cat.emoji}</TableCell>
                      <TableCell className="font-semibold text-sm">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{cat.description}</TableCell>
                      <TableCell className="text-sm font-mono">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded border border-border shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.color}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => openEdit(cat)}>
                            <IconPencil className="size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(cat)}>
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
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Name <span className="text-destructive">*</span></Label>
              <Input placeholder='e.g. "Cameras"' value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Emoji <span className="text-destructive">*</span></Label>
              <Input placeholder='e.g. "&#x1F4F7;"' value={emoji} onChange={(e) => setEmoji(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Description <span className="text-destructive">*</span></Label>
              <Input placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Color <span className="text-destructive">*</span></Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color.startsWith("#") ? color : "#3b82f6"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input cursor-pointer bg-transparent p-0.5"
                  title="Pick a color"
                />
                <Input
                  placeholder='e.g. "#3b82f6"'
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  className="flex-1"
                />
                {color && (
                  <div
                    className="h-9 w-9 rounded-md border border-input shrink-0"
                    style={{ backgroundColor: color }}
                    title={`Preview: ${color}`}
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={mutations.loading || !categoryFormValid}>
              {mutations.loading ? "Saving..." : editing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone. All models and units under this category must be removed first.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Models Section
// ---------------------------------------------------------------------------

function ModelsSection() {
  const { categories } = useEquipmentCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("__all__");
  const { models, loading, refetch } = useEquipmentModels(selectedCategory === "__all__" ? undefined : selectedCategory);
  const mutations = useEquipmentMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentModel | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function openAdd() {
    setEditing(null);
    setCategoryId(selectedCategory === "__all__" ? "" : selectedCategory);
    setModelName(""); setDescription(""); setImageUrl("");
    setDialogOpen(true);
  }

  function openEdit(model: EquipmentModel) {
    setEditing(model);
    setCategoryId(model.category_id);
    setModelName(model.model_name);
    setDescription(model.description);
    setImageUrl(model.image_url);
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = { category_id: categoryId, model_name: modelName, description, image_url: imageUrl };
    try {
      if (editing) {
        await mutations.updateModel(editing.id, data);
        toast.success("Model updated");
      } else {
        await mutations.createModel(data);
        toast.success("Model created");
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save model");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await mutations.deleteModel(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
      toast.success("Model deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete model");
    }
  }

  const filtered = models.filter((m) =>
    [m.model_name, m.description].some((v) => v.toLowerCase().includes(search.toLowerCase())),
  );

  // Find category name helper
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconDevices className="size-4 text-muted-foreground" />
            Models
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{models.length}</Badge>
          </div>
          <Button size="sm" onClick={openAdd}>
            <IconPlus className="size-4" /> Add Model
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input className="max-w-xs" placeholder="Search models..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
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
                    <TableHead>Model Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                        No models found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-semibold text-sm">{model.model_name}</TableCell>
                      <TableCell className="text-sm">{catName(model.category_id)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{model.description}</TableCell>
                      <TableCell>
                        {model.image_url ? (
                          <img src={model.image_url} alt={model.model_name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => openEdit(model)}>
                            <IconPencil className="size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(model)}>
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
            <DialogTitle>{editing ? "Edit Model" : "Add Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category <span className="text-destructive">*</span></Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Model Name <span className="text-destructive">*</span></Label>
              <Input placeholder='e.g. "Sony A7 IV"' value={modelName} onChange={(e) => setModelName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Description <span className="text-destructive">*</span></Label>
              <Input placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={mutations.loading || !modelName.trim() || !categoryId || !description.trim()}>
              {mutations.loading ? "Saving..." : editing ? "Save Changes" : "Add Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Model"
        message={`Are you sure you want to delete "${deleteTarget?.model_name}"? All units under this model must be removed first.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Units Section
// ---------------------------------------------------------------------------

function UnitsSection() {
  const { categories } = useEquipmentCategories();
  const { models } = useEquipmentModels();
  const [selectedModel, setSelectedModel] = useState<string>("__all__");
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const { units, loading, refetch } = useEquipmentUnits(selectedModel === "__all__" ? undefined : selectedModel, statusFilter === "__all__" ? undefined : statusFilter);
  const mutations = useEquipmentMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentUnit | null>(null);

  // Form state
  const [modelId, setModelId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [condition, setCondition] = useState<string>("Good");
  const [status, setStatus] = useState<string>("available");
  const [notes, setNotes] = useState("");

  function openAdd() {
    setEditing(null);
    setModelId(selectedModel === "__all__" ? "" : selectedModel);
    setUnitId(""); setCondition("Good"); setStatus("available"); setNotes("");
    setDialogOpen(true);
  }

  function openEdit(unit: EquipmentUnit) {
    setEditing(unit);
    setModelId(unit.model_id);
    setUnitId(unit.unit_id);
    setCondition(unit.condition);
    setStatus(unit.status);
    setNotes(unit.notes);
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = { model_id: modelId, unit_id: unitId, condition, status, notes };
    try {
      if (editing) {
        await mutations.updateUnit(editing.id, { unit_id: unitId, condition, status, notes });
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
  const modelName = (id: string) => models.find((m) => m.id === id)?.model_name ?? "—";

  const filtered = units.filter((u) =>
    [u.unit_id, modelName(u.model_id), u.notes].some((v) => v.toLowerCase().includes(search.toLowerCase())),
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
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.model_name}</SelectItem>
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
                      <TableCell className="font-mono text-sm font-semibold">{unit.unit_id}</TableCell>
                      <TableCell className="text-sm">{modelName(unit.model_id)}</TableCell>
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
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Model <span className="text-destructive">*</span></Label>
                <Select value={modelId} onValueChange={setModelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.model_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button onClick={handleSave} disabled={mutations.loading || !unitId.trim() || (!editing && !modelId)}>
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
        message={`Are you sure you want to delete unit "${deleteTarget?.unit_id}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
