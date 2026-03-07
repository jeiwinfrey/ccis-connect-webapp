// BorrowRequestRejected.tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const REJECTED_DATA = [
  { requestor: "Nina Flores", equipment: "BMPCC 6K Pro", unitId: "CAM-BMP-01", requested: "Feb 19 – Feb 22", rejectedBy: "Admin Maria A.", reason: "Already on loan during that period" },
  { requestor: "Leo Gomez", equipment: "DJI Transmission", unitId: "CMP-DJI-01", requested: "Feb 17 – Feb 18", rejectedBy: "Admin Jose B.", reason: "Unit under maintenance" },
];

export default function BorrowRequestRejected() {
  const [search, setSearch] = useState("");

  const filtered = REJECTED_DATA.filter(row =>
    [row.requestor, row.equipment, row.unitId, row.rejectedBy, row.reason]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Borrow Requests — Rejected</h1>
        <p className="text-sm text-muted-foreground">Borrow requests that have been declined.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          Rejected Requests
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
                  <TableHead>Requested</TableHead>
                  <TableHead>Rejected By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      No rejected requests found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-sm">{row.requestor}</TableCell>
                    <TableCell className="text-sm">{row.equipment}</TableCell>
                    <TableCell className="text-sm font-mono">{row.unitId}</TableCell>
                    <TableCell className="text-sm">{row.requested}</TableCell>
                    <TableCell className="text-sm">{row.rejectedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs">
                        Rejected
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