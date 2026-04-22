"use client";

import { useState } from "react";
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

export default function Dashboard({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const { requests: pendingBorrows, loading: loadingPB } = useBorrowRequests("pending");
  const { requests: acceptedBorrows } = useBorrowRequests("accepted");
  const { reservations: pendingReservations, loading: loadingPR } = useRoomReservations("pending");
  const { units, loading: loadingUnits } = useEquipmentUnitsWithModel();
  const { logs, loading: loadingLogs } = useActivityLog(10);

  const [attentionFilter, setAttentionFilter] = useState<"all" | "pending" | "on-loan">("all");

  const loading = loadingPB || loadingPR || loadingUnits || loadingLogs;

  const availableUnits = units.filter(u => u.status === "available").length;

  const stats = [
    { label: "Pending Borrows", value: pendingBorrows.length, icon: IconClock, color: "text-amber-600 bg-amber-50", trend: `${pendingBorrows.length} awaiting review` },
    { label: "Active Loans", value: acceptedBorrows.length, icon: IconBook, color: "text-blue-600 bg-blue-50", trend: `${acceptedBorrows.length} currently out` },
    { label: "Pending Reservations", value: pendingReservations.length, icon: IconCalendar, color: "text-violet-600 bg-violet-50", trend: `${pendingReservations.length} awaiting review` },
    { label: "Equipment Units", value: units.length, icon: IconPackage, color: "text-emerald-600 bg-emerald-50", trend: `${availableUnits} available` },
  ];

  // Combine pending borrows, reservations, and on-loan items for "Needs Attention"
  const allAttentionItems = [
    ...pendingBorrows.map(b => ({
      type: "Pending Borrow" as const,
      requestor: b.user?.name ?? "—",
      item: b.unit?.model?.modelName ?? "—",
      submitted: new Date(b.createdAt).toLocaleDateString(),
      status: "pending" as const,
      link: "borrow-pending" as const,
    })),
    ...pendingReservations.map(r => ({
      type: "Pending Room" as const,
      requestor: r.user?.name ?? "—",
      item: r.room?.name ?? "—",
      submitted: new Date(r.createdAt).toLocaleDateString(),
      status: "pending" as const,
      link: "room-pending" as const,
    })),
    ...acceptedBorrows.map(b => ({
      type: "On Loan" as const,
      requestor: b.user?.name ?? "—",
      item: b.unit?.model?.modelName ?? "—",
      submitted: `Due: ${b.endDate}`,
      status: "on-loan" as const,
      link: "borrow-accepted" as const,
    })),
  ];

  const filteredAttentionItems = allAttentionItems
    .filter(item => {
      if (attentionFilter === "pending") return item.status === "pending";
      if (attentionFilter === "on-loan") return item.status === "on-loan";
      return true;
    })
    .slice(0, 8);

  function timeAgo(dateStr: string | Date) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If diff is negative or very small, it's likely a timezone issue or just created
    if (diff < 0 || diff < 5000) return "just now";
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  function formatActionName(action: string): string {
    // Convert snake_case to Title Case
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
                        <p className="text-sm font-medium text-foreground">{formatActionName(item.action)}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p className="font-semibold text-sm">Needs Attention</p>
                <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">{filteredAttentionItems.length}</Badge>
              </div>
              <div className="px-5 py-3 border-b border-border">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAttentionFilter("all")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      attentionFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAttentionFilter("pending")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      attentionFilter === "pending"
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setAttentionFilter("on-loan")}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      attentionFilter === "on-loan"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    On Loan
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {filteredAttentionItems.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No items to show.
                  </div>
                ) : filteredAttentionItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate?.(item.link)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer w-full text-left"
                  >
                    <div className={`rounded-lg p-1.5 ${
                      item.type === "Pending Borrow" ? "text-blue-600 bg-blue-50" : 
                      item.type === "Pending Room" ? "text-violet-600 bg-violet-50" :
                      "text-emerald-600 bg-emerald-50"
                    }`}>
                      {item.type === "On Loan" ? <IconPackage className="size-3.5" /> :
                       item.type === "Pending Borrow" ? <IconBook className="size-3.5" /> : 
                       <IconCalendar className="size-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.requestor}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.item}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${
                        item.status === "pending" 
                          ? "text-amber-600 border-amber-300 bg-amber-50"
                          : "text-blue-600 border-blue-300 bg-blue-50"
                      }`}>
                        {item.status === "pending" ? "Pending" : "On Loan"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.submitted}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
