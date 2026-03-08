"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { IconCheck, IconX, IconFileText, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useRoomReservations, useRoomReservationMutations } from "@/hooks/useRoomReservations";
import { useRooms } from "@/hooks/useRooms";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { RoomReservationWithDetails } from "@/lib/supabase/types";

export default function RoomReservationPending() {
  const { reservations, loading, refetch } = useRoomReservations("pending");
  const mutations = useRoomReservationMutations();
  const { rooms } = useRooms();
  const [search, setSearch] = useState("");
  const [room, setRoom] = useState("all");
  const [selected, setSelected] = useState<RoomReservationWithDetails | null>(null);

  const filtered = reservations.filter(row => {
    const userName = row.users?.name ?? "";
    const roomName = row.rooms?.name ?? "";
    const purpose = row.purpose ?? "";
    const matchSearch = [userName, roomName, purpose]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchRoom = room === "all" || row.room_id === room;
    return matchSearch && matchRoom;
  });

  async function handleConfirm(id: string) {
    try {
      await mutations.updateRoomReservation(id, { status: "accepted" });
      setSelected(null);
      refetch();
      toast.success("Reservation confirmed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to confirm reservation");
    }
  }

  async function handleDecline(id: string) {
    try {
      await mutations.updateRoomReservation(id, { status: "rejected" });
      setSelected(null);
      refetch();
      toast.success("Reservation declined");
    } catch (e) {
      console.error(e);
      toast.error("Failed to decline reservation");
    }
  }

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  function formatDuration(start: string, end: string) {
    const [sh] = start.split(":").map(Number);
    const [eh] = end.split(":").map(Number);
    const diff = eh - sh;
    return diff === 1 ? "1 hour" : `${diff} hours`;
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Reservations — Pending</h1>
          <p className="text-sm text-muted-foreground">Room booking requests awaiting admin confirmation.</p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border font-semibold text-sm">
            Pending Reservations
            <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">{filtered.length}</Badge>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Input
                className="max-w-xs"
                placeholder="Search by name, room..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Rooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                        <TableCell className="text-sm">{formatDuration(row.start_time, row.end_time)}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{row.purpose}</TableCell>
                        <TableCell><StatusBadge status={row.status} /></TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleConfirm(row.id)}
                              disabled={mutations.loading}
                            >
                              <IconCheck className="size-3.5" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDecline(row.id)}
                              disabled={mutations.loading}
                            >
                              <IconX className="size-3.5" />
                              Decline
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
            <DialogTitle>Room Reservation Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Requestor */}
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requestor</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.users?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{selected.users?.department ?? ""}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-xs text-muted-foreground">{selected.users?.email ?? ""}</p>
              </div>

              {/* Room */}
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Room</p>
                <p className="text-sm font-medium text-foreground">{selected.rooms?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.rooms?.type} — Floor {selected.rooms?.floor} — Capacity: {selected.rooms?.capacity}
                </p>
              </div>

              {/* Schedule */}
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">{selected.reservation_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium text-foreground">{formatDuration(selected.start_time, selected.end_time)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatTime(selected.start_time)} – {formatTime(selected.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purpose</p>
                <p className="text-sm text-foreground">{selected.purpose}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => selected && handleDecline(selected.id)}
              disabled={mutations.loading}
            >
              <IconX className="size-4" />
              Decline
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80"
              onClick={() => selected && handleConfirm(selected.id)}
              disabled={mutations.loading}
            >
              <IconCheck className="size-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
