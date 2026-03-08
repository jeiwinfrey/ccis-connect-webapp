"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function BorrowRequestAccepted() {
  const { requests, loading } = useBorrowRequests("accepted");
  const [search, setSearch] = useState("");

  const filtered = requests.filter(row => {
    const userName = row.users?.name ?? "";
    const unitId = row.equipment_units?.unit_id ?? "";
    const modelName = row.equipment_units?.equipment_models?.model_name ?? "";
    return [userName, unitId, modelName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Borrow Requests — Accepted</h1>
        <p className="text-sm text-muted-foreground">All approved equipment loans currently active or completed.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          Accepted Requests
        </div>
        <div className="p-5 space-y-4">
          <Input className="max-w-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />

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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No accepted requests found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold text-sm">{row.users?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{row.equipment_units?.equipment_models?.model_name ?? "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{row.equipment_units?.unit_id ?? "—"}</TableCell>
                      <TableCell className="text-sm">{row.start_date}</TableCell>
                      <TableCell className="text-sm">{row.end_date}</TableCell>
                      <TableCell><StatusBadge status="accepted" /></TableCell>
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
