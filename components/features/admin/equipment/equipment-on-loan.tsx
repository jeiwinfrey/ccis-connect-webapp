"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconPackages, IconLoader2, IconRotateClockwise } from "@tabler/icons-react";
import { toast } from "sonner";
import { useEquipmentUnitsWithModel } from "@/hooks/useEquipment";
import { useBorrowRequests, useBorrowMutations } from "@/hooks/useBorrowRequests";

const conditionBadge: Record<string, string> = {
  Excellent: "text-emerald-600 border-emerald-300 bg-emerald-50",
  Good: "text-blue-600 border-blue-300 bg-blue-50",
  Fair: "text-amber-600 border-amber-300 bg-amber-50",
  Maintenance: "text-red-600 border-red-300 bg-red-50",
};

export default function EquipmentOnLoan() {
  const { units, loading } = useEquipmentUnitsWithModel("on-loan");
  const { requests: acceptedBorrows, refetch } = useBorrowRequests("accepted");
  const mutations = useBorrowMutations();
  const [search, setSearch] = useState("");

  // Build a map from unit_id (uuid) -> borrow request details for accepted borrows
  const borrowMap = new Map(
    acceptedBorrows.map(b => [b.unit_id, b])
  );

  const filtered = units.filter(row => {
    const modelName = row.equipment_models?.model_name ?? "";
    const borrow = borrowMap.get(row.id);
    const borrowerName = borrow?.users?.name ?? "";
    return [modelName, row.unit_id, borrowerName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  async function handleMarkReturned(borrowId: string) {
    try {
      await mutations.updateBorrowRequest(borrowId, { status: "returned" });
      refetch();
      toast.success("Marked as returned");
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark as returned");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipment Inventory — On Loan</h1>
        <p className="text-sm text-muted-foreground">Equipment currently borrowed by students or under maintenance.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconPackages className="size-4 text-orange-500" />
            On Loan
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 rounded-full px-2 py-0.5 text-xs">{filtered.length}</Badge>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Input
            className="max-w-xs"
            placeholder="Search borrower, equipment..."
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
                    <TableHead>Equipment</TableHead>
                    <TableHead>Unit ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Back</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                        No equipment on loan found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => {
                    const borrow = borrowMap.get(row.id);
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold text-sm">{row.equipment_models?.model_name ?? "—"}</TableCell>
                        <TableCell className="text-sm font-mono">{row.unit_id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm">{borrow?.users?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{borrow?.users?.student_id ?? ""}</div>
                        </TableCell>
                        <TableCell className="text-sm">{borrow?.start_date ?? "—"}</TableCell>
                        <TableCell className="text-sm">{borrow?.end_date ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${conditionBadge[row.condition] ?? ""}`}>
                            {row.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs">
                            On Loan
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => borrow?.id && handleMarkReturned(borrow.id)}
                            disabled={!borrow?.id || mutations.loading}
                          >
                            <IconRotateClockwise className="size-3.5" />
                            Mark Returned
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
