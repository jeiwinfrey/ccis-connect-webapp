"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";
import { useRooms, useAllRoomAvailability } from "@/hooks/useRooms";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { mapRoomsToUI, splitRooms, type Room, type TimeFilter } from "@/components/features/reserve/types";
import { FloorMap } from "@/components/features/reserve/FloorMap";
import { RoomDialog } from "@/components/features/reserve/RoomDialog";

const ROOM_TYPES = ["All", "Lecture", "HyFlex", "Lab Room"] as const;
type RoomTypeFilter = (typeof ROOM_TYPES)[number];

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];

// Time slots from 7:30 AM to 5:00 PM in 30-min increments (as decimal hours)
const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => 7.5 + i * 0.5);

function formatDecimalHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour < 12 ? "AM" : "PM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${min.toString().padStart(2, "0")} ${period}`;
}

function getNextDateForDay(dayOfWeek: number): string {
  const now = new Date();
  const current = now.getDay();
  let diff = dayOfWeek - current;
  if (diff < 0) diff += 7;
  const target = new Date(now);
  target.setDate(target.getDate() + diff);
  return target.toISOString().slice(0, 10);
}

function getCurrentDefaults() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  // Snap to nearest 30-min slot
  const snapped = Math.floor(hour * 2) / 2;
  const start = Math.max(7.5, Math.min(snapped, 16.5));
  const end = Math.min(start + 0.5, 17);
  return { day, start, end };
}

export default function ReserveRoom() {
  const defaults = useMemo(() => getCurrentDefaults(), []);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>("All");
  const [dayOfWeek, setDayOfWeek] = useState<number>(defaults.day);
  const [startTime, setStartTime] = useState<number>(defaults.start);
  const [endTime, setEndTime] = useState<number>(defaults.end);

  const { rooms: rawRooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const { reservations: activeReservations, loading: resLoading, refetch: refetchReservations } =
    useRoomReservations("accepted");
  const { availabilityMap, loading: availLoading, refetch: refetchAvailability } =
    useAllRoomAvailability(rawRooms.map((r) => r.id));

  const loading = roomsLoading || resLoading || availLoading;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchRooms();
        refetchReservations();
        refetchAvailability();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetchRooms, refetchReservations, refetchAvailability]);

  const timeFilter: TimeFilter = {
    dayOfWeek,
    startHour: startTime,
    endHour: endTime,
    date: getNextDateForDay(dayOfWeek),
  };

  const allRooms = mapRoomsToUI(rawRooms, activeReservations, availabilityMap, timeFilter);

  const floor1Rooms = allRooms.filter((r) => r.floor === "1st Floor");
  const floor2Rooms = allRooms.filter((r) => r.floor === "2nd Floor");

  function applyTypeFilter(rooms: Room[]) {
    if (typeFilter === "All") return rooms;
    return rooms.filter((r) => r.type.toLowerCase() === typeFilter.toLowerCase());
  }

  const vacantCount = allRooms.filter((r) => r.status === "vacant").length;
  const occupiedCount = allRooms.filter((r) => r.status === "occupied").length;

  // Available end times: everything after startTime
  const availableEndTimes = TIME_SLOTS.filter((t) => t > startTime);

  function handleStartTimeChange(value: string) {
    const t = Number(value);
    setStartTime(t);
    if (endTime <= t) {
      setEndTime(Math.min(t + 0.5, 17));
    }
  }

  function handleReservationComplete() {
    refetchRooms();
    refetchReservations();
    refetchAvailability();
    setSelectedRoom(null);
  }

  function renderFloorContent(rooms: Room[]) {
    const filtered = applyTypeFilter(rooms);
    const { topRooms, bottomRooms } = splitRooms(filtered);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No rooms match the selected filter.
        </div>
      );
    }

    return (
      <FloorMap
        topRooms={topRooms}
        bottomRooms={bottomRooms}
        onSelectRoom={setSelectedRoom}
      />
    );
  }

  return (
    <div className="px-4 py-4 md:px-10 md:py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reserve a Room</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pick a time slot to see which rooms are available.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                {vacantCount} Available
              </Badge>
              <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                {occupiedCount} Unavailable
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Time filter */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day</label>
              <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}{d.value === new Date().getDay() ? " (Today)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</label>
              <Select value={String(startTime)} onValueChange={handleStartTimeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.slice(0, -1).map((t) => (
                    <SelectItem key={t} value={String(t)}>{formatDecimalHour(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</label>
              <Select value={String(endTime)} onValueChange={(v) => setEndTime(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEndTimes.map((t) => (
                    <SelectItem key={t} value={String(t)}>{formatDecimalHour(t)}</SelectItem>
                  ))}
                  <SelectItem value="17">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading rooms...
            </div>
          ) : allRooms.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No rooms found.
            </div>
          ) : (
            <>
              {/* Room type filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {ROOM_TYPES.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={typeFilter === type ? "default" : "outline"}
                    onClick={() => setTypeFilter(type)}
                    className="h-7 text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* Floor tabs */}
              <Tabs defaultValue="floor1">
                <TabsList>
                  <TabsTrigger value="floor1">1st Floor</TabsTrigger>
                  <TabsTrigger value="floor2">2nd Floor</TabsTrigger>
                </TabsList>

                <TabsContent value="floor1" className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Floor Plan — 1st Floor
                  </p>
                  {renderFloorContent(floor1Rooms)}
                </TabsContent>

                <TabsContent value="floor2" className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Floor Plan — 2nd Floor
                  </p>
                  {renderFloorContent(floor2Rooms)}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      <RoomDialog
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onReservationComplete={handleReservationComplete}
        initialDayOfWeek={dayOfWeek}
        initialStartTime={startTime}
        initialEndTime={endTime}
      />
    </div>
  );
}
