"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { IconCheck, IconX, IconFileText, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useBorrowRequests, useBorrowMutations } from "@/hooks/useBorrowRequests";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { BorrowRequestWithDetails } from "@/lib/db/types";

export default function BorrowRequestPending() {
  const { requests, loading, refetch } = useBorrowRequests("pending");
  const mutations = useBorrowMutations();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BorrowRequestWithDetails | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BorrowRequestWithDetails | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // Auto-refresh every 30 seconds to stay in sync with user actions
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const filtered = requests.filter(row => {
    const userName = row.user?.name ?? "";
    const unitId = row.unit?.unitId ?? "";
    const modelName = row.unit?.model?.modelName ?? "";
    return [userName, unitId, modelName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  async function handleApprove(id: string) {
    try {
      await mutations.updateBorrowRequest(id, { status: "accepted" });
      setSelected(null);
      refetch();
      toast.success("Borrow request approved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to approve request");
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    try {
      await mutations.updateBorrowRequest(rejectTarget.id, {
        status: "rejected",
        adminNotes: rejectNotes.trim() || undefined,
      });
      setRejectTarget(null);
      setRejectNotes("");
      refetch();
      toast.success("Borrow request rejected");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reject request");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Borrow Requests — Pending</h1>
          <p className="text-sm text-muted-foreground">Review and act on pending equipment borrow requests.</p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-sm">
              Pending Requests
              <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">{filtered.length}</Badge>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <Input
              className="max-w-xs"
              placeholder="Search by name, equipment..."
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
                      <TableHead>Requestor</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Unit ID</TableHead>
                      <TableHead>Borrow Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                          No pending requests found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-semibold text-sm">{row.user?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{row.user?.studentId ?? row.user?.email ?? ""}</div>
                        </TableCell>
                        <TableCell className="text-sm">{row.unit?.model?.modelName ?? "—"}</TableCell>
                        <TableCell className="text-sm font-mono">{row.unit?.unitId ?? "—"}</TableCell>
                        <TableCell className="text-sm">{row.startDate}</TableCell>
                        <TableCell className="text-sm">{row.endDate}</TableCell>
                        <TableCell className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><StatusBadge status={row.status} /></TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleApprove(row.id)}
                              disabled={mutations.loading}
                            >
                              <IconCheck className="size-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setRejectTarget(row)}
                              disabled={mutations.loading}
                            >
                              <IconX className="size-3.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => setSelected(row)}
                            >
                              <IconFileText className="size-3.5" />
                              Detail
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
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Borrow Request Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requestor</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.user?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{selected.user?.studentId ?? ""}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-xs text-muted-foreground">{selected.user?.email ?? ""}</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Item</p>
                    <p className="text-sm font-medium text-foreground">{selected.unit?.model?.modelName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit ID</p>
                    <p className="text-sm font-mono font-medium text-foreground">{selected.unit?.unitId ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Borrow Date</p>
                    <p className="text-sm font-medium text-foreground">{selected.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Return Date</p>
                    <p className="text-sm font-medium text-foreground">{selected.endDate}</p>
                  </div>
                </div>
              </div>

              {selected.purpose && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purpose</p>
                  <p className="text-sm text-foreground">{selected.purpose}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => { setRejectTarget(selected!); setSelected(null); }}
              disabled={mutations.loading}
            >
              <IconX className="size-4" /> Reject
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80"
              onClick={() => selected && handleApprove(selected.id)}
              disabled={mutations.loading}
            >
              <IconCheck className="size-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={open => { if (!open) { setRejectTarget(null); setRejectNotes(""); } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Borrow Request</DialogTitle>
            <DialogDescription>
              Rejecting request from <span className="font-semibold">{rejectTarget?.user?.name ?? "—"}</span> for{" "}
              <span className="font-semibold">{rejectTarget?.unit?.model?.modelName ?? "—"}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Provide a reason for this rejection (optional)..."
              rows={4}
              className="resize-none"
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setRejectTarget(null); setRejectNotes(""); }}
              disabled={mutations.loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={mutations.loading}
            >
              {mutations.loading ? <IconLoader2 className="size-4 animate-spin mr-1" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
