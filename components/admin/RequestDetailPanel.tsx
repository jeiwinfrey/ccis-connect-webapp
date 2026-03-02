"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconX,
  IconUser,
  IconCamera,
  IconBuilding,
  IconCalendar,
  IconFileText,
  IconAlertTriangle,
  IconCircleCheck,
  IconMicrophone,
  IconBulb,
  IconVideo,
  IconClipboardList,
  IconArrowBack,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";
import { type AdminRequest, useAdminStore } from "@/lib/admin-store";
import { RejectDialog } from "./RejectDialog";
import { cn } from "@/lib/utils";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  if (category === "Audio") return <IconMicrophone className={className} />;
  if (category === "Lighting") return <IconBulb className={className} />;
  if (category === "Cameras") return <IconCamera className={className} />;
  return <IconVideo className={className} />;
}

function getReturnUrgency(returnDateISO: string): {
  label: string;
  daysLeft: number;
  classes: string;
  icon: React.ReactNode;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ret = new Date(returnDateISO);
  ret.setHours(0, 0, 0, 0);
  const diff = Math.round((ret.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return {
      label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`,
      daysLeft: diff,
      classes: "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400",
      icon: <IconAlertCircle className="w-3.5 h-3.5" />,
    };
  }
  if (diff === 0) {
    return {
      label: "Due today",
      daysLeft: 0,
      classes: "bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400",
      icon: <IconClock className="w-3.5 h-3.5" />,
    };
  }
  if (diff <= 2) {
    return {
      label: `Due in ${diff} day${diff === 1 ? "" : "s"}`,
      daysLeft: diff,
      classes: "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
      icon: <IconAlertTriangle className="w-3.5 h-3.5" />,
    };
  }
  return {
    label: `Due in ${diff} days`,
    daysLeft: diff,
    classes: "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    icon: <IconCircleCheck className="w-3.5 h-3.5" />,
  };
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <span className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
          {label}
        </p>
        <div className="text-sm text-foreground font-medium">{value}</div>
      </div>
    </div>
  );
}

interface RequestDetailPanelProps {
  request: AdminRequest | null;
  onClose: () => void;
}

export function RequestDetailPanel({ request, onClose }: RequestDetailPanelProps) {
  const { approve, reject } = useAdminStore();
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <IconClipboardList className="w-8 h-8 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No request selected</p>
          <p className="text-xs text-muted-foreground mt-1">Select a request from the list to view its details and take action</p>
        </div>
      </div>
    );
  }

  const isBorrow = request.type === "borrow";
  const label = isBorrow
    ? `${request.model} — ${request.studentName}`
    : `${request.roomName} — ${request.studentName}`;

  const urgency = isBorrow && request.status === "approved"
    ? getReturnUrgency(request.returnDateISO)
    : null;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Panel header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/40 flex-shrink-0">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
              isBorrow
                ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
                : "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400"
            )}>
              {isBorrow
                ? <CategoryIcon category={request.category} className="w-5 h-5" />
                : <IconBuilding className="w-5 h-5" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground">
                  {isBorrow ? request.model : request.roomName}
                </h2>
                <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {isBorrow ? "Borrow" : "Reservation"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted {request.submittedDate}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors flex-shrink-0"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Status banner */}
          <div className={cn(
            "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border",
            request.status === "pending"
              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
              : request.status === "approved"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
              : "bg-rose-50 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
          )}>
            {request.status === "pending" && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                Awaiting your review
              </>
            )}
            {request.status === "approved" && (
              <>
                <IconCircleCheck className="w-3.5 h-3.5" />
                Approved — item is out on loan
              </>
            )}
            {request.status === "rejected" && (
              <>
                <IconAlertTriangle className="w-3.5 h-3.5" />
                Rejected
              </>
            )}
          </div>

          {/* Return urgency banner (approved borrows only) */}
          {urgency && (
            <div className={cn(
              "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border",
              urgency.classes
            )}>
              {urgency.icon}
              <span>{urgency.label} — {isBorrow && request.returnDate}</span>
            </div>
          )}
        </div>

        {/* Detail rows */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <DetailRow
            icon={<IconUser className="w-4 h-4" />}
            label="Requester"
            value={
              <div>
                <p>{request.studentName}</p>
                <p className="text-xs text-muted-foreground font-normal">{request.studentId}</p>
              </div>
            }
          />

          {isBorrow ? (
            <>
              <DetailRow
                icon={<CategoryIcon category={request.category} className="w-4 h-4" />}
                label="Equipment"
                value={
                  <div>
                    <p>{request.model}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      Unit: {request.unitId} · {request.category}
                    </p>
                  </div>
                }
              />
              <DetailRow
                icon={<IconCalendar className="w-4 h-4" />}
                label="Loan Period"
                value={
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-muted-foreground w-12">Borrow</span>
                      <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">{request.borrowDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-muted-foreground w-12">Return</span>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded",
                        urgency && urgency.daysLeft <= 2
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-muted"
                      )}>{request.returnDate}</span>
                      {urgency && (
                        <span className={cn("text-[10px] font-bold", urgency.classes.includes("rose") ? "text-rose-600" : urgency.classes.includes("orange") ? "text-orange-600" : urgency.classes.includes("amber") ? "text-amber-600" : "text-emerald-600")}>
                          {urgency.label}
                        </span>
                      )}
                    </div>
                  </div>
                }
              />
            </>
          ) : (
            <>
              <DetailRow
                icon={<IconBuilding className="w-4 h-4" />}
                label="Room"
                value={
                  <div>
                    <p>{request.roomName} ({request.roomId})</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {request.roomType} · {request.floor}
                    </p>
                  </div>
                }
              />
              <DetailRow
                icon={<IconCalendar className="w-4 h-4" />}
                label="Date & Time"
                value={
                  <div>
                    <p>{request.date}</p>
                    <p className="text-xs text-muted-foreground font-normal">{request.timeSlot}</p>
                  </div>
                }
              />
            </>
          )}

          <DetailRow
            icon={<IconFileText className="w-4 h-4" />}
            label="Purpose"
            value={<p className="text-sm leading-relaxed font-normal">{request.purpose}</p>}
          />

          {request.status === "rejected" && request.rejectionReason && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 p-3 text-xs text-rose-700 dark:text-rose-400">
              <IconAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Rejection Reason</p>
                <p className="leading-relaxed">{request.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {(request.status === "pending" || request.status === "approved") && (
          <div className="px-5 py-4 border-t border-border/40 flex-shrink-0 space-y-2">
            {request.status === "pending" && (
              <>
                <p className="text-xs text-muted-foreground mb-1">Take action on this request:</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => approve(request.id)}
                  >
                    <IconCheck className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 gap-1.5"
                    variant="destructive"
                    onClick={() => setRejectOpen(true)}
                  >
                    <IconX className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </>
            )}
            {request.status === "approved" && (
              <>
                <p className="text-xs text-muted-foreground mb-1">
                  {urgency && urgency.daysLeft <= 0
                    ? "This item is overdue. Consider following up with the borrower."
                    : urgency && urgency.daysLeft <= 2
                    ? "Return date is approaching. You may revoke if needed."
                    : "This request has been approved and item is out on loan."}
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => setRejectOpen(true)}
                >
                  <IconArrowBack className="w-4 h-4" />
                  Revoke Approval
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => reject(request.id, reason)}
        requestLabel={label}
      />
    </>
  );
}
