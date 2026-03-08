"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function RoomReservationRejected() {
  const { reservations, loading } = useRoomReservations("rejected");
  const [search, setSearch] = useState("");

  const filtered = reservations.filter(row => {
    const userName = row.users?.name ?? "";
    const roomName = row.rooms?.name ?? "";
    const notes = row.admin_notes ?? "";
    return [userName, roomName, notes]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Reservations — Rejected</h1>
        <p className="text-sm text-muted-foreground">Room booking requests that have been declined.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          Rejected Reservations
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
                    <TableHead>Room</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No rejected reservations found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-semibold text-sm">{row.users?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{row.users?.department ?? ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{row.rooms?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{row.reservation_date}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatTime(row.start_time)} – {formatTime(row.end_time)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{row.admin_notes || "—"}</TableCell>
                      <TableCell><StatusBadge status="rejected" /></TableCell>
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
