"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { IconLoader2, IconChartBar } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { useRoomReservations } from "@/hooks/useRoomReservations";
import { useEquipmentUnitsWithModel } from "@/hooks/useEquipment";

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const statusChartConfig = {
  pending: { label: "Pending", color: "hsl(45, 93%, 47%)" },
  accepted: { label: "Accepted", color: "hsl(142, 71%, 45%)" },
  rejected: { label: "Rejected", color: "hsl(0, 84%, 60%)" },
  returned: { label: "Returned", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig;

const trendChartConfig = {
  borrows: { label: "Borrow Requests", color: "hsl(217, 91%, 60%)" },
  reservations: { label: "Room Reservations", color: "hsl(270, 70%, 60%)" },
} satisfies ChartConfig;

const roomChartConfig = {
  reservations: { label: "Reservations", color: "hsl(270, 70%, 60%)" },
} satisfies ChartConfig;

const borrowCategoryChartConfig = {
  borrows: { label: "Borrow Requests", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig;

const equipmentChartConfig = {
  available: { label: "Available", color: "hsl(142, 71%, 45%)" },
  "on-loan": { label: "On Loan", color: "hsl(217, 91%, 60%)" },
  maintenance: { label: "Maintenance", color: "hsl(45, 93%, 47%)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Analytics() {
  const { requests: borrows, loading: borrowLoading } = useBorrowRequests();
  const { reservations, loading: resLoading } = useRoomReservations();
  const { units, loading: unitsLoading } = useEquipmentUnitsWithModel();

  const loading = borrowLoading || resLoading || unitsLoading;

  // --- Borrow Status Distribution (Pie) ---
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, returned: 0 };
    borrows.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({
        status,
        count,
        fill: `var(--color-${status})`,
      }));
  }, [borrows]);

  // --- Monthly Trends (Line) — last 6 months ---
  const trendData = useMemo(() => {
    const now = new Date();
    const months: { label: string; borrows: number; reservations: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const bCount = borrows.filter((b) => {
        const cd = new Date(b.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;

      const rCount = reservations.filter((r) => {
        const cd = new Date(r.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;

      months.push({ label, borrows: bCount, reservations: rCount });
    }

    return months;
  }, [borrows, reservations]);

  // --- Room Popularity (Bar) ---
  const roomData = useMemo(() => {
    const roomCounts: Record<string, { name: string; reservations: number }> = {};
    reservations.forEach((r) => {
      const name = r.room?.name ?? "Unknown";
      if (!roomCounts[name]) roomCounts[name] = { name, reservations: 0 };
      roomCounts[name].reservations++;
    });
    return Object.values(roomCounts)
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 8);
  }, [reservations]);

  // --- Equipment Borrowing by Category (Bar) ---
  const borrowCategoryData = useMemo(() => {
    const categoryCounts: Record<string, { category: string; borrows: number }> = {};
    borrows.forEach((b) => {
      const category = b.unit?.model?.category?.name ?? "Other";
      if (!categoryCounts[category]) {
        categoryCounts[category] = { category, borrows: 0 };
      }
      categoryCounts[category].borrows++;
    });

    return Object.values(categoryCounts)
      .sort((a, b) => b.borrows - a.borrows)
      .slice(0, 8);
  }, [borrows]);

  // --- Equipment Status (Bar) ---
  const equipmentData = useMemo(() => {
    const catCounts: Record<string, { category: string; available: number; "on-loan": number; maintenance: number }> = {};
    units.forEach((u) => {
      const cat = u.model?.category?.name ?? "Other";
      if (!catCounts[cat]) catCounts[cat] = { category: cat, available: 0, "on-loan": 0, maintenance: 0 };
      if (u.status === "available") catCounts[cat].available++;
      else if (u.status === "on-loan") catCounts[cat]["on-loan"]++;
      else if (u.status === "maintenance") catCounts[cat].maintenance++;
    });
    return Object.values(catCounts);
  }, [units]);

  // --- Summary stats ---
  const stats = useMemo(() => {
    const totalBorrows = borrows.length;
    const activeBorrows = borrows.filter((b) => b.status === "accepted").length;
    const totalReservations = reservations.length;
    const totalUnits = units.length;
    const availableUnits = units.filter((u) => u.status === "available").length;
    return { totalBorrows, activeBorrows, totalReservations, totalUnits, availableUnits };
  }, [borrows, reservations, units]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <IconChartBar className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground">
            Overview of equipment usage, room traffic, and request trends.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Borrows", value: stats.totalBorrows },
          { label: "Active Borrows", value: stats.activeBorrows },
          { label: "Total Reservations", value: stats.totalReservations },
          { label: "Total Units", value: stats.totalUnits },
          { label: "Available Units", value: stats.availableUnits },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Request Trends (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="borrows"
                  stroke="var(--color-borrows)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="reservations"
                  stroke="var(--color-reservations)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Borrow Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Borrow Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[280px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Popularity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Room Reservations by Room</CardTitle>
          </CardHeader>
          <CardContent>
            {roomData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                No room reservation data yet.
              </div>
            ) : (
              <ChartContainer config={roomChartConfig} className="h-[280px] w-full">
                <BarChart data={roomData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    className="text-[10px]"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="reservations" fill="var(--color-reservations)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Equipment Borrowing by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Equipment Borrowing by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {borrowCategoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                No equipment borrowing data yet.
              </div>
            ) : (
              <ChartContainer config={borrowCategoryChartConfig} className="h-[280px] w-full">
                <BarChart data={borrowCategoryData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    className="text-[10px]"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="borrows" fill="var(--color-borrows)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Category & Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Equipment Units by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {equipmentData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                No equipment data yet.
              </div>
            ) : (
              <ChartContainer config={equipmentChartConfig} className="h-[280px] w-full">
                <BarChart data={equipmentData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} className="text-[10px]" />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="available" fill="var(--color-available)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="on-loan" fill="var(--color-on-loan)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="maintenance" fill="var(--color-maintenance)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
