"use client";

import { Badge } from "@/components/ui/badge";
import {
  IconBook,
  IconCalendar,
  IconPackage,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { useEquipmentUnitsWithModel } from "@/hooks/useEquipment";
import { useActivityLog } from "@/hooks/useAdmin";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const { requests: pendingBorrows, loading: loadingPB } = useBorrowRequests("pending");
  const { requests: acceptedBorrows } = useBorrowRequests("accepted");
  const { reservations: pendingReservations, loading: loadingPR } = useRoomReservations("pending");
  const { units, loading: loadingUnits } = useEquipmentUnitsWithModel();
  const { logs, loading: loadingLogs } = useActivityLog(10);

  const loading = loadingPB || loadingPR || loadingUnits || loadingLogs;

  const availableUnits = units.filter(u => u.status === "available").length;

  const stats = [
    { label: "Pending Borrows", value: pendingBorrows.length, icon: IconClock, color: "text-amber-600 bg-amber-50", trend: `${pendingBorrows.length} awaiting review` },
    { label: "Active Loans", value: acceptedBorrows.length, icon: IconBook, color: "text-blue-600 bg-blue-50", trend: `${acceptedBorrows.length} currently out` },
    { label: "Pending Reservations", value: pendingReservations.length, icon: IconCalendar, color: "text-violet-600 bg-violet-50", trend: `${pendingReservations.length} awaiting review` },
    { label: "Equipment Units", value: units.length, icon: IconPackage, color: "text-emerald-600 bg-emerald-50", trend: `${availableUnits} available` },
  ];

  // Combine pending borrows and reservations for "Needs Attention"
  const pendingActions = [
    ...pendingBorrows.map(b => ({
      type: "Borrow" as const,
      requestor: b.user?.name ?? "—",
      item: b.unit?.model?.modelName ?? "—",
      submitted: new Date(b.createdAt).toLocaleDateString(),
    })),
    ...pendingReservations.map(r => ({
      type: "Room" as const,
      requestor: r.user?.name ?? "—",
      item: r.room?.name ?? "—",
      submitted: new Date(r.createdAt).toLocaleDateString(),
    })),
  ].slice(0, 8);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const statusConfig: Record<string, { badge: string; icon: typeof IconCheck }> = {
    approved: { badge: "text-emerald-600 border-emerald-300 bg-emerald-50", icon: IconCheck },
    accepted: { badge: "text-emerald-600 border-emerald-300 bg-emerald-50", icon: IconCheck },
    rejected: { badge: "text-red-600 border-red-300 bg-red-50", icon: IconX },
    pending: { badge: "text-amber-600 border-amber-300 bg-amber-50", icon: IconClock },
    returned: { badge: "text-blue-600 border-blue-300 bg-blue-50", icon: IconArrowRight },
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of all activity, metrics, and recent requests.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin mr-2" /> Loading dashboard...
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="size-4" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <IconTrendingUp className="size-3" />
                    {stat.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p className="font-semibold text-sm">Recent Activity</p>
                <Badge variant="outline" className="text-xs">{logs.length} events</Badge>
              </div>
              <div className="divide-y divide-border">
                {logs.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                ) : logs.map((item) => {
                  const cfg = statusConfig[item.action.toLowerCase().includes("reject") || item.action.toLowerCase().includes("decline") ? "rejected" :
                    item.action.toLowerCase().includes("approv") || item.action.toLowerCase().includes("confirm") || item.action.toLowerCase().includes("accept") ? "approved" :
                    item.action.toLowerCase().includes("return") ? "returned" : "pending"] ?? statusConfig.pending;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className={`rounded-lg p-1.5 ${cfg.badge}`}>
                        <cfg.icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt.toString())}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p className="font-semibold text-sm">Needs Attention</p>
                <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">{pendingActions.length}</Badge>
              </div>
              <div className="divide-y divide-border">
                {pendingActions.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No pending actions.
                  </div>
                ) : pendingActions.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className={`rounded-lg p-1.5 ${item.type === "Borrow" ? "text-blue-600 bg-blue-50" : "text-violet-600 bg-violet-50"}`}>
                      {item.type === "Borrow" ? <IconBook className="size-3.5" /> : <IconCalendar className="size-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.requestor}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.item}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                        Pending
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.submitted}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
