"use client";

import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  IconPlus, IconPencil, IconTrash, IconDoor, IconCalendar, IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRooms, useRoomAvailability, useRoomMutations } from "@/hooks/useRooms";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AvailabilityCalendar, type TimeSlot } from "@/components/shared/AvailabilityCalendar";
import type { Room, RoomAvailability } from "@/lib/supabase/types";

export default function RoomManagement() {
  const { rooms, loading, refetch } = useRooms();
  const mutations = useRoomMutations();
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("__all__");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [scheduleRoom, setScheduleRoom] = useState<Room | null>(null);

  // Form state
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [floor, setFloor] = useState("");

  // Availability schedule state
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Load availability when editing schedule
  const { availability, refetch: refetchAvailability } = useRoomAvailability(scheduleRoom?.id ?? null);

  useEffect(() => {
    if (availability.length > 0) {
      setSlots(
        availability.map((a) => ({
          day_of_week: a.day_of_week,
          start_hour: a.start_hour,
          end_hour: a.end_hour,
        })),
      );
    } else if (scheduleRoom) {
      setSlots([]);
    }
  }, [availability, scheduleRoom]);

  function openAdd() {
    setEditing(null);
    setRoomNumber(""); setName(""); setType(""); setCapacity(""); setFloor("");
    setDialogOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setRoomNumber(room.room_number);
    setName(room.name);
    setType(room.type);
    setCapacity(room.capacity);
    setFloor(room.floor);
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = { room_number: roomNumber, name, type, capacity, floor };
    try {
      if (editing) {
        await mutations.updateRoom(editing.id, data);
        toast.success("Room updated");
      } else {
        await mutations.createRoom(data);
        toast.success("Room created");
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save room");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await mutations.deleteRoom(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
      toast.success("Room deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete room");
    }
  }

  async function handleSaveSchedule() {
    if (!scheduleRoom) return;
    try {
      await mutations.setAvailability(scheduleRoom.id, slots);
      setScheduleRoom(null);
      refetchAvailability();
      toast.success("Schedule saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save schedule");
    }
  }

  // Get unique floors for filter
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  const filtered = rooms.filter((r) => {
    const matchSearch = [r.room_number, r.name, r.type]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()));
    const matchFloor = floorFilter === "__all__" || r.floor === floorFilter;
    return matchSearch && matchFloor;
  });

  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Room Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove rooms and configure their weekly availability.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <IconDoor className="size-4 text-muted-foreground" />
              Rooms
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
                {rooms.length}
              </Badge>
            </div>
            <Button size="sm" onClick={openAdd}>
              <IconPlus className="size-4" /> Add Room
            </Button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Input
                className="max-w-xs"
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Floors" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="__all__">All Floors</SelectItem>
                  {floors.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
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
                      <TableHead>Room Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                          No rooms found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-mono text-sm font-semibold">{room.room_number}</TableCell>
                        <TableCell className="font-semibold text-sm">{room.name}</TableCell>
                        <TableCell className="text-sm">{room.type}</TableCell>
                        <TableCell className="text-sm">{room.capacity}</TableCell>
                        <TableCell className="text-sm">{room.floor}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => setScheduleRoom(room)}
                            >
                              <IconCalendar className="size-3.5" /> Schedule
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => openEdit(room)}
                            >
                              <IconPencil className="size-3.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(room)}
                            >
                              <IconTrash className="size-3.5" /> Delete
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

      {/* Add/Edit Room Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Room Number</Label>
              <Input placeholder='e.g. "R101"' value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Name</Label>
              <Input placeholder='e.g. "Seminar Room B"' value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Type</Label>
              <Input placeholder='e.g. "Seminar Room", "Computer Lab"' value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Capacity</Label>
                <Input placeholder='e.g. "30 pax"' value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Floor</Label>
                <Input placeholder='e.g. "1st Floor"' value={floor} onChange={(e) => setFloor(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={mutations.loading || !roomNumber.trim() || !name.trim()}>
              {mutations.loading ? "Saving..." : editing ? "Save Changes" : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Schedule Dialog */}
      <Dialog open={!!scheduleRoom} onOpenChange={(open) => !open && setScheduleRoom(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Availability Schedule — {scheduleRoom?.name} ({scheduleRoom?.room_number})
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Click on time slots to toggle availability. Filled slots indicate when the room is available for booking.
          </p>
          <AvailabilityCalendar selectedSlots={slots} onSlotsChange={setSlots} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleRoom(null)}>Cancel</Button>
            <Button onClick={handleSaveSchedule} disabled={mutations.loading}>
              {mutations.loading ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Room"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.room_number})? This cannot be undone. Rooms with future reservations cannot be deleted.`}
        confirmLabel="Delete"
        variant="danger"
        loading={mutations.loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
