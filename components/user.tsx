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
  IconX,
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
      item: r.unit?.model?.modelName ?? "Equipment",
      dates: formatDateRange(r.startDate, r.endDate),
      submitted: formatShort(r.createdAt.toString()),
    })),
    ...pendingReservations.map((r) => ({
      type: "Room" as const,
      item: r.room?.name ?? "Room",
      dates: formatShort(r.reservationDate),
      submitted: formatShort(r.createdAt.toString()),
    })),
  ];

  const borrowHistory = allBorrows
    .filter((r) => r.status !== "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      id: r.id,
      equipment: r.unit?.model?.modelName ?? "Equipment",
      unitId: r.unit?.unitId ?? "",
      dates: formatDateRange(r.startDate, r.endDate),
      status: r.status,
      note: r.adminNotes?.trim() || null,
    }));

  const roomHistory = allReservations
    .filter((r) => r.status !== "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      id: r.id,
      room: r.room?.name ?? "Room",
      roomNumber: r.room?.roomNumber ?? "",
      date: formatShort(r.reservationDate),
      time: `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
      status: r.status,
      note: r.adminNotes?.trim() || null,
    }));

  const loading = authLoading || borrowLoading || resLoading;

  function formatTime(time: string): string {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const minute = parseInt(m);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return minute === 0 ? `${h12}:00 ${ampm}` : `${h12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  }

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
                  {user?.studentId || user?.username || ""} &middot;{" "}
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
                      {borrowHistory.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 px-6 py-3">
                          <div className="rounded-lg p-1.5 text-blue-600 bg-blue-50">
                            <IconBook className="size-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.equipment}</p>
                            <p className="text-xs text-muted-foreground">{item.unitId} &middot; {item.dates}</p>
                            {item.status === "rejected" && item.note && (
                              <p className="mt-1 text-xs text-destructive">Reason: {item.note}</p>
                            )}
                          </div>
                          <Badge variant="outline" className={`shrink-0 text-xs ${
                            item.status === "accepted"
                              ? "text-blue-600 border-blue-300 bg-blue-50"
                              : item.status === "returned"
                                ? "text-emerald-600 border-emerald-300 bg-emerald-50"
                                : "text-red-600 border-red-300 bg-red-50"
                          }`}>
                            {item.status === "accepted" ? (
                              <IconClock className="size-3 mr-0.5" />
                            ) : item.status === "returned" ? (
                              <IconCheck className="size-3 mr-0.5" />
                            ) : (
                              <IconX className="size-3 mr-0.5" />
                            )}
                            {item.status === "accepted" ? "Active" : item.status === "returned" ? "Returned" : "Rejected"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Room Reservation History */}
          {roomHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Room Reservation History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border -mx-6">
                  {roomHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-6 py-3">
                      <div className="rounded-lg p-1.5 text-violet-600 bg-violet-50">
                        <IconCalendar className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.room}</p>
                        <p className="text-xs text-muted-foreground">{item.roomNumber} &middot; {item.date} &middot; {item.time}</p>
                        {item.status === "rejected" && item.note && (
                          <p className="mt-1 text-xs text-destructive">Reason: {item.note}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${
                        item.status === "accepted"
                          ? "text-emerald-600 border-emerald-300 bg-emerald-50"
                          : "text-red-600 border-red-300 bg-red-50"
                      }`}>
                        {item.status === "accepted" ? (
                          <IconCheck className="size-3 mr-0.5" />
                        ) : (
                          <IconX className="size-3 mr-0.5" />
                        )}
                        {item.status === "accepted" ? "Confirmed" : "Rejected"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (s.getTime() === e.getTime()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

function formatShort(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function parseLocalDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);

  if (!match) {
    return new Date(dateStr);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
