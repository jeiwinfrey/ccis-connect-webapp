"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconShield,
  IconLayoutDashboard,
  IconBook,
  IconCalendar,
  IconList,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconMenu2,
  IconX,
  IconMap,
  IconCamera,
  IconBuilding,
  IconMicrophone,
  IconBulb,
  IconVideo,
  IconAlertTriangle,
  IconAlertCircle,
  IconArrowRight,
} from "@tabler/icons-react";
import { Logo } from "@/public/logo";
import { type AdminRequest, type AdminBorrowRequest, type RequestType, useAdminStore } from "@/lib/admin-store";
import { StatsBar } from "./StatsBar";
import { RequestList } from "./RequestList";
import { RequestDetailPanel } from "./RequestDetailPanel";
import { cn } from "@/lib/utils";

type NavSection = "overview" | "all" | "borrow" | "reservation" | "pending" | "approved" | "rejected";

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <IconLayoutDashboard className="w-4 h-4" />, group: "Dashboard" },
  { id: "all", label: "All Requests", icon: <IconList className="w-4 h-4" />, group: "Requests" },
  { id: "borrow", label: "Borrow", icon: <IconBook className="w-4 h-4" /> },
  { id: "reservation", label: "Reservations", icon: <IconCalendar className="w-4 h-4" /> },
  { id: "pending", label: "Pending", icon: <IconClock className="w-4 h-4" />, group: "By Status" },
  { id: "approved", label: "Approved", icon: <IconCircleCheck className="w-4 h-4" /> },
  { id: "rejected", label: "Rejected", icon: <IconCircleX className="w-4 h-4" /> },
];

function getBadgeCount(id: NavSection, requests: AdminRequest[]): number | null {
  if (id === "all") return requests.length;
  if (id === "borrow") return requests.filter((r) => r.type === "borrow").length;
  if (id === "reservation") return requests.filter((r) => r.type === "reservation").length;
  if (id === "pending") return requests.filter((r) => r.status === "pending").length;
  if (id === "approved") return requests.filter((r) => r.status === "approved").length;
  if (id === "rejected") return requests.filter((r) => r.status === "rejected").length;
  return null;
}

function getFilteredRequests(
  section: NavSection,
  requests: AdminRequest[]
): { list: AdminRequest[]; typeFilter?: RequestType } {
  if (section === "borrow") return { list: requests, typeFilter: "borrow" };
  if (section === "reservation") return { list: requests, typeFilter: "reservation" };
  if (section === "pending") return { list: requests.filter((r) => r.status === "pending") };
  if (section === "approved") return { list: requests.filter((r) => r.status === "approved") };
  if (section === "rejected") return { list: requests.filter((r) => r.status === "rejected") };
  return { list: requests };
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  if (category === "Audio") return <IconMicrophone className={className} />;
  if (category === "Lighting") return <IconBulb className={className} />;
  if (category === "Cameras") return <IconCamera className={className} />;
  return <IconVideo className={className} />;
}

function RequestIcon({ request, size = "sm" }: { request: AdminRequest; size?: "sm" | "md" }) {
  const isBorrow = request.type === "borrow";
  const dim = size === "md" ? "w-9 h-9 rounded-xl" : "w-7 h-7 rounded-lg";
  const icon = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className={cn(
      "flex items-center justify-center flex-shrink-0",
      dim,
      isBorrow
        ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
        : "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400"
    )}>
      {isBorrow
        ? <CategoryIcon category={(request as AdminBorrowRequest).category} className={icon} />
        : <IconBuilding className={icon} />
      }
    </div>
  );
}

function getReturnDaysLeft(returnDateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ret = new Date(returnDateISO);
  ret.setHours(0, 0, 0, 0);
  return Math.round((ret.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function AdminDashboard() {
  const { requests } = useAdminStore();
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const { list, typeFilter } = getFilteredRequests(activeSection, requests);

  const upcomingReturns = requests
    .filter((r): r is AdminBorrowRequest => r.type === "borrow" && r.status === "approved")
    .map((r) => ({ ...r, daysLeft: getReturnDaysLeft(r.returnDateISO) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  function handleNav(section: NavSection) {
    setActiveSection(section);
    setSelectedRequest(null);
    setSidebarOpen(false);
  }

  const grouped: { group: string; items: NavItem[] }[] = [];
  for (const item of navItems) {
    if (item.group) {
      grouped.push({ group: item.group, items: [item] });
    } else {
      grouped[grouped.length - 1].items.push(item);
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconShield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">CCIS Connect</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {grouped.map(({ group, items }) => (
          <div key={group}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const count = getBadgeCount(item.id, requests);
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {count !== null && count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.id === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border/40 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Logo className="w-4 h-4" strokeWidth={1.8} />
          Back to App
        </Link>
        <Link
          href="/virtual-map"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <IconMap className="w-4 h-4" />
          Virtual Map
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border/40 bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 w-56 bg-card border-r border-border/40 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border/40 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu2 className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground capitalize">
                {navItems.find((n) => n.id === activeSection)?.label ?? "Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                CCIS Connect · Admin Panel
              </p>
            </div>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => handleNav("pending")}
              className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              {pendingCount} pending
            </button>
          )}
        </header>

        {/* Body */}
        {activeSection === "overview" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            <StatsBar requests={requests} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Needs Review */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <IconClock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">Needs Review</span>
                    {pendingCount > 0 && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleNav("pending")}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                  >
                    View all <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-border/40">
                  {requests.filter((r) => r.status === "pending").slice(0, 5).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setActiveSection("all"); setSelectedRequest(r); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <RequestIcon request={r} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {r.type === "borrow" ? r.model : r.roomName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.studentName} · {r.submittedDate}
                        </p>
                      </div>
                      <IconArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                  {pendingCount === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                      <IconCircleCheck className="w-7 h-7 text-emerald-500 opacity-70" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Returns */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-semibold text-foreground">Upcoming Returns</span>
                  </div>
                  <button
                    onClick={() => handleNav("approved")}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                  >
                    View all <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-border/40">
                  {upcomingReturns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                      <IconCalendar className="w-7 h-7 opacity-25" />
                      <p className="text-sm">No active loans</p>
                    </div>
                  )}
                  {upcomingReturns.map((r) => {
                    const isOverdue = r.daysLeft < 0;
                    const isDueToday = r.daysLeft === 0;
                    const isUrgent = r.daysLeft <= 2;
                    return (
                      <button
                        key={r.id}
                        onClick={() => { setActiveSection("all"); setSelectedRequest(r); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <RequestIcon request={r} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.model}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.studentName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                            isOverdue
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                              : isDueToday
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                              : isUrgent
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          )}>
                            {isOverdue && <IconAlertCircle className="w-2.5 h-2.5" />}
                            {isDueToday && <IconClock className="w-2.5 h-2.5" />}
                            {isUrgent && !isOverdue && !isDueToday && <IconAlertTriangle className="w-2.5 h-2.5" />}
                            {isOverdue
                              ? `${Math.abs(r.daysLeft)}d overdue`
                              : isDueToday
                              ? "Today"
                              : `${r.daysLeft}d left`}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{r.returnDate}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <IconList className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Recent Activity</span>
                  </div>
                  <button
                    onClick={() => handleNav("all")}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                  >
                    View all <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-border/40">
                  {[...requests]
                    .sort((a, b) => (a.status === "pending" ? -1 : 1))
                    .slice(0, 6)
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setActiveSection("all"); setSelectedRequest(r); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <RequestIcon request={r} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {r.type === "borrow" ? r.model : r.roomName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{r.studentName}</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : r.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                        )}>
                          {r.status}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List + detail panel */
          <div className="flex-1 flex overflow-hidden">
            <div className={cn(
              "flex flex-col border-r border-border/40 bg-card overflow-hidden",
              selectedRequest ? "hidden md:flex md:w-80 lg:w-96" : "flex-1 md:w-80 lg:w-96 md:flex-none"
            )}>
              <RequestList
                requests={list}
                typeFilter={typeFilter}
                selectedId={selectedRequest?.id ?? null}
                onSelect={setSelectedRequest}
              />
            </div>

            <div className={cn(
              "flex flex-col overflow-hidden bg-background",
              selectedRequest ? "flex-1" : "hidden md:flex md:flex-1"
            )}>
              <RequestDetailPanel
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
