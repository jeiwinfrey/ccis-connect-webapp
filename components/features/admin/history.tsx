"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconHistory, IconLoader2 } from "@tabler/icons-react";
import { useActivityLog } from "@/hooks/useAdmin";

export default function History() {
  const { logs, loading } = useActivityLog();
  const [search, setSearch] = useState("");

  const filtered = logs.filter(row => {
    const userName = row.users?.name ?? "";
    return [row.action, row.detail, userName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Full activity log of all actions taken in the system.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconHistory className="size-4 text-muted-foreground" />
            Activity Log
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{filtered.length} entries</Badge>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Input
            className="max-w-xs"
            placeholder="Search action, user, detail..."
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
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                        No history entries found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()} {new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">{row.action}</TableCell>
                      <TableCell className="text-sm">{row.users?.name ?? "System"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{row.detail}</TableCell>
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
