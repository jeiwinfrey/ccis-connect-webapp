// RoomReservationAccepted.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const CONFIRMED_DATA = [
  { dept: "Design Dept", room: "Studio A", date: "Feb 28, 2026", time: "9:00 AM – 3:00 PM", confirmedBy: "Admin Maria A." },
  { dept: "Theater Arts", room: "Recording Booth 1", date: "Feb 27, 2026", time: "2:00 PM – 4:00 PM", confirmedBy: "Admin Jose B." },
  { dept: "ComSci Dept", room: "Edit Suite B", date: "Feb 26, 2026", time: "8:00 AM – 10:00 AM", confirmedBy: "Admin Maria A." },
];

export default function RoomReservationAccepted() {
  const [search, setSearch] = useState("");

  const filtered = CONFIRMED_DATA.filter(row =>
    [row.dept, row.room, row.confirmedBy]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Reservations — Confirmed</h1>
        <p className="text-sm text-muted-foreground">All confirmed and active room bookings.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          Confirmed Reservations
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
                  <TableHead>Time</TableHead>
                  <TableHead>Confirmed By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      No confirmed reservations found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-sm">{row.dept}</TableCell>
                    <TableCell className="text-sm">{row.room}</TableCell>
                    <TableCell className="text-sm">{row.date}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{row.time}</TableCell>
                    <TableCell className="text-sm">{row.confirmedBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 text-xs">
                        Confirmed
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