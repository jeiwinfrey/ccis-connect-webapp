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
import { IconPlus, IconPencil, IconTrash, IconDevices, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useEquipmentCategories,
  useEquipmentModels,
  useEquipmentMutations,
} from "@/hooks/useEquipment";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { EquipmentModel } from "@/lib/db/types";

export function ModelsSection() {
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
    setCategoryId(model.categoryId);
    setModelName(model.modelName);
    setDescription(model.description);
    setImageUrl(model.imageUrl);
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = { categoryId: categoryId, modelName: modelName, description, imageUrl: imageUrl };
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
    [m.modelName, m.description].some((v) => v.toLowerCase().includes(search.toLowerCase())),
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
                      <TableCell className="font-semibold text-sm">{model.modelName}</TableCell>
                      <TableCell className="text-sm">{catName(model.categoryId)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{model.description}</TableCell>
                      <TableCell>
                        {model.imageUrl ? (
                          <img src={model.imageUrl} alt={model.modelName} className="h-8 w-8 rounded object-cover" />
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
        message={`Are you sure you want to delete "${deleteTarget?.modelName}"? All units under this model must be removed first.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
