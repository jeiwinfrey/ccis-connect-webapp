import {
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCamera,
  IconBuilding,
} from "@tabler/icons-react";
import { type AdminRequest } from "@/lib/admin-store";

interface StatsBarProps {
  requests: AdminRequest[];
}

export function StatsBar({ requests }: StatsBarProps) {
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const borrows = requests.filter((r) => r.type === "borrow").length;
  const reservations = requests.filter((r) => r.type === "reservation").length;
  const total = requests.length;

  const stats = [
    {
      label: "Pending",
      value: pending,
      sub: `${total > 0 ? Math.round((pending / total) * 100) : 0}% of total`,
      icon: <IconClock className="w-5 h-5" />,
      iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
      accent: "border-l-amber-400",
    },
    {
      label: "Approved",
      value: approved,
      sub: `${total > 0 ? Math.round((approved / total) * 100) : 0}% of total`,
      icon: <IconCircleCheck className="w-5 h-5" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      accent: "border-l-emerald-400",
    },
    {
      label: "Rejected",
      value: rejected,
      sub: `${total > 0 ? Math.round((rejected / total) * 100) : 0}% of total`,
      icon: <IconCircleX className="w-5 h-5" />,
      iconBg: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
      accent: "border-l-rose-400",
    },
    {
      label: "Borrow Requests",
      value: borrows,
      sub: `${reservations} room reservations`,
      icon: <IconCamera className="w-5 h-5" />,
      iconBg: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
      accent: "border-l-violet-400",
    },
    {
      label: "Room Reservations",
      value: reservations,
      sub: `${borrows} borrow requests`,
      icon: <IconBuilding className="w-5 h-5" />,
      iconBg: "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
      accent: "border-l-sky-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-card border border-border/60 rounded-xl p-4 flex flex-col gap-3 border-l-4 ${s.accent} shadow-xs`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {s.label}
            </span>
            <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${s.iconBg}`}>
              {s.icon}
            </span>
          </div>
          <div>
            <span className="text-3xl font-bold text-foreground tabular-nums">{s.value}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
