// BorrowRequestAccepted.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const ACCEPTED_DATA = [
  { requestor: "Maria Santos", equipment: "Canon EOS R5", unitId: "CAM-R5-01", borrowDate: "Feb 18", returnDate: "Feb 20", approvedBy: "Admin Maria A." },
  { requestor: "Paolo Reyes", equipment: "Zoom H6", unitId: "AUD-H6-02", borrowDate: "Feb 19", returnDate: "Feb 21", approvedBy: "Admin Maria A." },
  { requestor: "Kris Aquino", equipment: "Godox SL200W", unitId: "LGT-GX200-01", borrowDate: "Feb 20", returnDate: "Feb 22", approvedBy: "Admin Jose B." },
  { requestor: "Diane Cruz", equipment: "Samsung T9 SSD", unitId: "STG-T9-01", borrowDate: "Feb 15", returnDate: "Feb 17", approvedBy: "Admin Maria A." },
];

export default function BorrowRequestAccepted() {
  const [search, setSearch] = useState("");

  const filtered = ACCEPTED_DATA.filter(row =>
    [row.requestor, row.equipment, row.unitId, row.approvedBy]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Borrow Requests — Accepted</h1>
        <p className="text-sm text-muted-foreground">All approved equipment loans currently active or completed.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          Accepted Requests
        </div>
        <div className="p-5 space-y-4">
          <Input
            className="max-w-xs"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requestor</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      No accepted requests found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-sm">{row.requestor}</TableCell>
                    <TableCell className="text-sm">{row.equipment}</TableCell>
                    <TableCell className="text-sm font-mono">{row.unitId}</TableCell>
                    <TableCell className="text-sm">{row.borrowDate}</TableCell>
                    <TableCell className="text-sm">{row.returnDate}</TableCell>
                    <TableCell className="text-sm">{row.approvedBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-xs">
                        Accepted
                      </Badge>
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