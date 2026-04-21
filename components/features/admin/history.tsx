"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IconHistory, IconLoader2, IconCheck, IconSettings } from "@tabler/icons-react";
import { useActivityLog } from "@/hooks/useAdmin";

type FilterTab = "all" | "approve-reject" | "manage";

const APPROVE_REJECT_ACTIONS = new Set([
  "borrow_request_approved",
  "borrow_request_rejected",
  "borrow_request_returned",
  "room_reservation_approved",
  "room_reservation_rejected",
]);

const MANAGE_ACTIONS = new Set([
  "room_created", "room_updated", "room_deleted",
  "category_created", "category_updated", "category_deleted",
  "model_created", "model_updated", "model_deleted",
  "unit_created", "unit_updated", "unit_deleted",
]);

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    borrow_request_approved: "Borrow Approved",
    borrow_request_rejected: "Borrow Rejected",
    borrow_request_returned: "Borrow Returned",
    room_reservation_approved: "Reservation Approved",
    room_reservation_rejected: "Reservation Rejected",
    room_created: "Room Created",
    room_updated: "Room Updated",
    room_deleted: "Room Deleted",
    category_created: "Category Created",
    category_updated: "Category Updated",
    category_deleted: "Category Deleted",
    model_created: "Model Created",
    model_updated: "Model Updated",
    model_deleted: "Model Deleted",
    unit_created: "Unit Created",
    unit_updated: "Unit Updated",
    unit_deleted: "Unit Deleted",
  };
  return labels[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionVariant(action: string): "default" | "destructive" | "outline" | "secondary" {
  if (action.includes("approved") || action.includes("created")) return "default";
  if (action.includes("rejected") || action.includes("deleted")) return "destructive";
  if (action.includes("returned") || action.includes("updated")) return "secondary";
  return "outline";
}

export default function History() {
  const { logs, loading } = useActivityLog();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = logs.filter(row => {
    const userName = row.users?.name ?? "";
    const matchSearch = [row.action, row.detail, userName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (activeTab === "approve-reject") return APPROVE_REJECT_ACTIONS.has(row.action);
    if (activeTab === "manage") return MANAGE_ACTIONS.has(row.action);
    return true;
  });

  const tabs: { key: FilterTab; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All", icon: IconHistory },
    { key: "approve-reject", label: "Accept / Reject Log", icon: IconCheck },
    { key: "manage", label: "Manage Rooms & Equipment", icon: IconSettings },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Admin action log — accept/reject decisions and room & equipment management.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
            className="gap-1.5"
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconHistory className="size-4 text-muted-foreground" />
            {activeTab === "approve-reject" ? "Accept / Reject Log" : activeTab === "manage" ? "Manage Rooms & Equipment Log" : "Activity Log"}
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{filtered.length} entries</Badge>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Input
            className="max-w-xs"
            placeholder="Search action, admin, detail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                        No history entries found.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionVariant(row.action)} className="text-xs whitespace-nowrap">
                          {actionLabel(row.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{row.users?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[320px] truncate">{row.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
