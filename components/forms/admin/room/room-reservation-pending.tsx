// RoomReservationPending.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PENDING_DATA = [
  { dept: "Film Dept", requestedBy: "P. Navarro", room: "Studio A", date: "Mar 5, 2026", time: "8:00 AM – 6:00 PM", duration: "Full Day", purpose: "Thesis film shoot" },
  { dept: "Music Club", requestedBy: "T. Miranda", room: "Recording Booth 1", date: "Mar 4, 2026", time: "1:00 PM – 5:00 PM", duration: "4 hours", purpose: "Original music recording" },
  { dept: "Journalism Dept", requestedBy: "C. Bautista", room: "Edit Suite B", date: "Mar 3, 2026", time: "10:00 AM – 12:00 PM", duration: "2 hours", purpose: "Video editing for school paper" },
];

export default function RoomReservationPending() {
  const [search, setSearch] = useState("");
  const [room, setRoom] = useState("all");

  const filtered = PENDING_DATA.filter(row => {
    const matchSearch = [row.dept, row.requestedBy, row.room, row.purpose]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchRoom = room === "all" || row.room === room;
    return matchSearch && matchRoom;
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Reservations — Pending</h1>
        <p className="text-sm text-muted-foreground">Room booking requests awaiting admin confirmation.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border font-semibold text-sm">
          Pending Reservations
          <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">3</Badge>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input
              className="max-w-xs"
              placeholder="Search by name, room…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="Studio A">Studio A</SelectItem>
                <SelectItem value="Recording Booth 1">Recording Booth 1</SelectItem>
                <SelectItem value="Edit Suite B">Edit Suite B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requestor / Dept</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No pending reservations found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-semibold text-sm">{row.dept}</div>
                      <div className="text-xs text-muted-foreground">Requested by: {row.requestedBy}</div>
                    </TableCell>
                    <TableCell className="text-sm">{row.room}</TableCell>
                    <TableCell className="text-sm">{row.date}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{row.time}</TableCell>
                    <TableCell className="text-sm">{row.duration}</TableCell>
                    <TableCell className="text-sm">{row.purpose}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap space-x-1">
                      <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-300 hover:bg-green-50">
                        ✔ Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-300 hover:bg-red-50">
                        ✘ Decline
                      </Button>
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