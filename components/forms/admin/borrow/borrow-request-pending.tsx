// BorrowRequestPending.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PENDING_DATA = [
  { requestor: "Juan dela Cruz", studentId: "2024-00123", equipment: "Sony A7 IV", unitId: "CAM-A7IV-01", borrowDate: "Feb 24, 2026", returnDate: "Feb 27, 2026", submitted: "Feb 21", category: "Cameras" },
  { requestor: "Ana Reyes", studentId: "2024-00456", equipment: "MacBook Pro M3", unitId: "CMP-MBP-01", borrowDate: "Mar 1, 2026", returnDate: "Mar 3, 2026", submitted: "Feb 22", category: "Computing" },
  { requestor: "Ben Santos", studentId: "2024-00789", equipment: "Rode NTG5", unitId: "AUD-NTG5-01", borrowDate: "Feb 25, 2026", returnDate: "Feb 25, 2026", submitted: "Feb 21", category: "Audio" },
  { requestor: "Carla Lim", studentId: "2024-01011", equipment: "Aputure 300x", unitId: "LGT-AP300-01", borrowDate: "Feb 26, 2026", returnDate: "Feb 28, 2026", submitted: "Feb 20", category: "Lighting" },
  { requestor: "David Tan", studentId: "2024-01213", equipment: "GoPro HERO12", unitId: "ACT-GP12-01", borrowDate: "Mar 2, 2026", returnDate: "Mar 2, 2026", submitted: "Feb 22", category: "Cameras" },
];

export default function BorrowRequestPending() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = PENDING_DATA.filter(row => {
    const matchSearch = [row.requestor, row.equipment, row.unitId, row.studentId]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || row.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Borrow Requests — Pending</h1>
        <p className="text-sm text-muted-foreground">Review and act on pending equipment borrow requests.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-sm">
            Pending Requests
            <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">5</Badge>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input
              className="max-w-xs"
              placeholder="Search by name, equipment…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cameras">Cameras</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Lighting">Lighting</SelectItem>
                <SelectItem value="Computing">Computing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requestor</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No pending requests found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-semibold text-sm">{row.requestor}</div>
                      <div className="text-xs text-muted-foreground">{row.studentId}</div>
                    </TableCell>
                    <TableCell className="text-sm">{row.equipment}</TableCell>
                    <TableCell className="text-sm font-mono">{row.unitId}</TableCell>
                    <TableCell className="text-sm">{row.borrowDate}</TableCell>
                    <TableCell className="text-sm">{row.returnDate}</TableCell>
                    <TableCell className="text-sm">{row.submitted}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap space-x-1">
                      <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-300 hover:bg-green-50">
                        ✔ Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-300 hover:bg-red-50">
                        ✘ Reject
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}