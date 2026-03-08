"use client";

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
import { useState } from "react";
import { IconShield, IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAdminUsers, useAdminMutations } from "@/hooks/useAdmin";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const roleBadge: Record<string, string> = {
  super_admin: "text-violet-600 border-violet-300 bg-violet-50",
  admin: "text-blue-600 border-blue-300 bg-blue-50",
};

const roleLabel: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

export default function Admin() {
  const { users, loading, refetch } = useAdminUsers();
  const mutations = useAdminMutations();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "super_admin">("admin");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = users.filter(row =>
    [row.name, row.email, row.role]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleAdd() {
    if (!newName.trim() || !newEmail.trim()) return;
    try {
      await mutations.createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        department: newDepartment.trim() || "CCIS",
      });
      setNewName("");
      setNewEmail("");
      setNewDepartment("");
      setNewRole("admin");
      setAddOpen(false);
      refetch();
      toast.success("Administrator added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add administrator");
    }
  }

  async function handleRemove() {
    if (!deleteTarget) return;
    try {
      await mutations.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
      toast.success("Administrator removed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove administrator");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage administrator accounts and permissions.</p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <IconShield className="size-4 text-muted-foreground" />
              Administrators
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{users.length}</Badge>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <IconPlus className="size-4" />
              Add Admin
            </Button>
          </div>
          <div className="p-5 space-y-4">
            <Input
              className="max-w-xs"
              placeholder="Search admins..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                          No administrators found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold text-sm">{row.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.email}</TableCell>
                        <TableCell className="text-sm">{row.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${roleBadge[row.role] ?? ""}`}>
                            {roleLabel[row.role] ?? row.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(row.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {row.role !== "super_admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
                            >
                              <IconTrash className="size-3.5" />
                              Remove
                            </Button>
                          )}
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

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Juan dela Cruz"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-sm font-semibold">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="e.g. juan@mmsu.edu.ph"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-dept" className="text-sm font-semibold">Department</Label>
              <Input
                id="admin-dept"
                placeholder="e.g. CCIS"
                value={newDepartment}
                onChange={e => setNewDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Role</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={newRole === "admin" ? "default" : "outline"}
                  onClick={() => setNewRole("admin")}
                >
                  Admin
                </Button>
                <Button
                  size="sm"
                  variant={newRole === "super_admin" ? "default" : "outline"}
                  onClick={() => setNewRole("super_admin")}
                >
                  Super Admin
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={mutations.loading}>
              {mutations.loading ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Administrator"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        variant="danger"
      />
    </>
  );
}
