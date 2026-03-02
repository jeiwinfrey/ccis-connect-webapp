"use client";

import {
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCamera,
  IconBuilding,
  IconMicrophone,
  IconBulb,
  IconVideo,
} from "@tabler/icons-react";
import { type AdminRequest, type RequestStatus } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

const statusConfig: Record<RequestStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    icon: <IconClock className="w-3 h-3" />,
  },
  approved: {
    label: "Approved",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    icon: <IconCircleCheck className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    icon: <IconCircleX className="w-3 h-3" />,
  },
};

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  if (category === "Audio") return <IconMicrophone className={className} />;
  if (category === "Lighting") return <IconBulb className={className} />;
  if (category === "Cameras") return <IconCamera className={className} />;
  return <IconVideo className={className} />;
}

interface RequestRowProps {
  request: AdminRequest;
  isSelected: boolean;
  onSelect: (r: AdminRequest) => void;
}

export function RequestRow({ request, isSelected, onSelect }: RequestRowProps) {
  const isBorrow = request.type === "borrow";
  const status = statusConfig[request.status];

  const title = isBorrow ? request.model : request.roomName;
  const subtitle = isBorrow
    ? `${request.unitId} · ${request.category}`
    : `${request.roomId} · ${request.roomType}`;

  return (
    <button
      onClick={() => onSelect(request)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 text-left transition-colors rounded-lg",
        isSelected
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted/60 border border-transparent"
      )}
    >
      {/* Icon */}
      <span className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        isBorrow
          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
          : "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400"
      )}>
        {isBorrow
          ? <CategoryIcon category={request.category} className="w-4 h-4" />
          : <IconBuilding className="w-4 h-4" />
        }
      </span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0">
            {isBorrow ? "Borrow" : "Reserve"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {request.studentName} · {subtitle}
        </p>
      </div>

      {/* Status pill */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
          status.classes
        )}>
          {status.icon}
          {status.label}
        </span>
        <span className="text-[10px] text-muted-foreground">{request.submittedDate}</span>
      </div>
    </button>
  );
}
