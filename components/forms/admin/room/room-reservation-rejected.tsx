// RoomReservationRejected.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const REJECTED_DATA = [
  { requestor: "Mass Comm Dept", room: "Studio A", date: "Feb 20, 2026", rejectedBy: "Admin Maria A.", reason: "Conflicting reservation" },
  { requestor: "Broadcasting Club", room: "Recording Booth 1", date: "Feb 18, 2026", rejectedBy: "Admin Jose B.", reason: "Booth under maintenance" },
];

export default function RoomReservationRejected() {
  const [search, setSearch] = useState("");

  const filtered = REJECTED_DATA.filter(row =>
    [row.requestor, row.room, row.rejectedBy, row.reason]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

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
          <Input
            className="max-w-xs"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requestor / Dept</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rejected By</TableHead>
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
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-sm">{row.requestor}</TableCell>
                    <TableCell className="text-sm">{row.room}</TableCell>
                    <TableCell className="text-sm">{row.date}</TableCell>
                    <TableCell className="text-sm">{row.rejectedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs">
                        Rejected
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}