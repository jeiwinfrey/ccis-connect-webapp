"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { IconSearch, IconInbox } from "@tabler/icons-react";
import { type AdminRequest, type RequestStatus, type RequestType } from "@/lib/admin-store";
import { RequestRow } from "./RequestRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestListProps {
  requests: AdminRequest[];
  typeFilter?: RequestType;
  selectedId: string | null;
  onSelect: (r: AdminRequest) => void;
}

export function RequestList({ requests, typeFilter, selectedId, onSelect }: RequestListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  const filtered = requests.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    if (r.studentName.toLowerCase().includes(q)) return true;
    if (r.studentId.toLowerCase().includes(q)) return true;
    if (r.type === "borrow") return r.model.toLowerCase().includes(q) || r.unitId.toLowerCase().includes(q);
    return r.roomName.toLowerCase().includes(q) || r.roomId.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filters */}
      <div className="flex gap-2 px-4 pt-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="px-4">
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "request" : "requests"}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <IconInbox className="w-8 h-8 opacity-25" />
            <p className="text-sm">No requests match your filters.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              isSelected={selectedId === r.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
