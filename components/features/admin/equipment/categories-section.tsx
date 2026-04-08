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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { IconPlus, IconPencil, IconTrash, IconCategory, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useEquipmentCategories, useEquipmentMutations } from "@/hooks/useEquipment";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { EquipmentCategory } from "@/lib/db/types";

export function CategoriesSection() {
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
              <Input placeholder='e.g. "📷"' value={emoji} onChange={(e) => setEmoji(e.target.value)} required />
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
