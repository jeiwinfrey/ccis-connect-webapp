"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  IconLogout,
  IconUser,
  IconBook,
  IconCalendar,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { useAuth } from "@/lib/auth/context";

export default function User() {
  const { user, logout, loading: authLoading } = useAuth();

  // Fetch borrow requests filtered by current user
  const { requests: allBorrows, loading: borrowLoading } = useBorrowRequests(
    undefined, // no status filter — fetch all statuses
    user?.id,  // filter by current user
  );
  const { reservations: allReservations, loading: resLoading } = useRoomReservations(
    undefined, // no status filter
    user?.id,  // filter by current user
  );

  // Split borrow requests by status
  const pendingBorrows = allBorrows.filter((r) => r.status === "pending");
  const pendingReservations = allReservations.filter((r) => r.status === "pending");
  const pendingRequests = [
    ...pendingBorrows.map((r) => ({
      type: "Borrow" as const,
      item: r.equipment_units?.equipment_models?.model_name ?? "Equipment",
      dates: formatDateRange(r.start_date, r.end_date),
      submitted: formatShort(r.created_at),
    })),
    ...pendingReservations.map((r) => ({
      type: "Room" as const,
      item: r.rooms?.name ?? "Room",
      dates: formatShort(r.reservation_date),
      submitted: formatShort(r.created_at),
    })),
  ];

  const borrowHistory = allBorrows
    .filter((r) => r.status === "accepted" || r.status === "returned")
    .map((r) => ({
      equipment: r.equipment_units?.equipment_models?.model_name ?? "Equipment",
      unitId: r.equipment_units?.unit_id ?? "",
      dates: formatDateRange(r.start_date, r.end_date),
      status: r.status === "accepted" ? ("active" as const) : ("returned" as const),
    }));

  const reservationHistory = allReservations
    .filter((r) => r.status === "accepted")
    .map((r) => ({
      room: r.rooms?.name ?? "Room",
      date: formatLong(r.reservation_date),
      time: `${formatTime(r.start_time)} – ${formatTime(r.end_time)}`,
      status: isUpcoming(r.reservation_date, r.start_time)
        ? ("confirmed" as const)
        : ("completed" as const),
    }));

  const loading = authLoading || borrowLoading || resLoading;

  return (
    <div className="px-4 py-4 md:px-10 md:py-6 space-y-6">
      {/* User Info Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <IconUser className="size-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {user?.name ?? "Loading..."}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.student_id || user?.username || ""} &middot;{" "}
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.department}</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={logout}>
              <IconLogout className="size-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <Link href="/borrow" className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3">
                <IconBook className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Borrow Equipment</p>
                <p className="text-xs text-muted-foreground">Browse available equipment and submit a request</p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <Link href="/reserve" className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-50 p-3">
                <IconCalendar className="size-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Reserve a Room</p>
                <p className="text-xs text-muted-foreground">View room availability and make a reservation</p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin mr-2" /> Loading your data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Pending Requests */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Pending Requests</CardTitle>
                    <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                      {pendingRequests.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No pending requests.
                    </div>
                  ) : (
                    <div className="divide-y divide-border -mx-6">
                      {pendingRequests.map((req, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3">
                          <div className={`rounded-lg p-1.5 ${req.type === "Borrow" ? "text-blue-600 bg-blue-50" : "text-violet-600 bg-violet-50"}`}>
                            {req.type === "Borrow" ? <IconBook className="size-3.5" /> : <IconCalendar className="size-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{req.item}</p>
                            <p className="text-xs text-muted-foreground">{req.dates}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                              <IconClock className="size-3 mr-0.5" />
                              Pending
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{req.submitted}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Borrow History */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Borrow History</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {borrowHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No borrow history yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border -mx-6">
                      {borrowHistory.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3">
                          <div className="rounded-lg p-1.5 text-blue-600 bg-blue-50">
                            <IconBook className="size-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.equipment}</p>
                            <p className="text-xs text-muted-foreground">{item.unitId} &middot; {item.dates}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            item.status === "active"
                              ? "text-blue-600 border-blue-300 bg-blue-50"
                              : "text-emerald-600 border-emerald-300 bg-emerald-50"
                          }`}>
                            {item.status === "active" ? <IconClock className="size-3 mr-0.5" /> : <IconCheck className="size-3 mr-0.5" />}
                            {item.status === "active" ? "Active" : "Returned"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Room Reservations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Room Reservations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {reservationHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No room reservations yet.
                </div>
              ) : (
                <div className="divide-y divide-border -mx-6">
                  {reservationHistory.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3">
                      <div className="rounded-lg p-1.5 text-violet-600 bg-violet-50">
                        <IconCalendar className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.room}</p>
                        <p className="text-xs text-muted-foreground">{item.date} &middot; {item.time}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        item.status === "confirmed"
                          ? "text-blue-600 border-blue-300 bg-blue-50"
                          : "text-emerald-600 border-emerald-300 bg-emerald-50"
                      }`}>
                        {item.status === "confirmed" ? <IconClock className="size-3 mr-0.5" /> : <IconCheck className="size-3 mr-0.5" />}
                        {item.status === "confirmed" ? "Confirmed" : "Completed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (s.getTime() === e.getTime()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isUpcoming(dateStr: string, startTime: string): boolean {
  const d = new Date(dateStr);
  const [h, m] = startTime.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.getTime() > Date.now();
}
